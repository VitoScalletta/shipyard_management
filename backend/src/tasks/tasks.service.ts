import { CreateTaskDto } from './dto/create-task.dto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { In, Repository } from 'typeorm';
import { TaskDependency } from './entities/task-dependency.entity';
import { CreateTaskDependencyDto } from './dto/create-task-dependency.dto';
import { TaskStatus } from './enums/task-status.enum';
import { TaskResource } from './entities/task-resource.entity';
import { Resource } from '../resources/entities/resource.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(TaskDependency)
    private taskDependencyRepository: Repository<TaskDependency>,
    @InjectRepository(TaskResource)
    private taskResourceRepository: Repository<TaskResource>,
    @InjectRepository(Resource)
    private resourceRepository: Repository<Resource>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private eventEmitter: EventEmitter2,
  ) {}

  async addDependency(createDto: CreateTaskDependencyDto) {
    if (createDto.predecessorId === createDto.successorId) {
      throw new BadRequestException('Bir görev kendisine bağımlı olamaz.');
    }

    const predecessor = await this.taskRepository.findOne({
      where: { id: createDto.predecessorId },
    });
    const successor = await this.taskRepository.findOne({
      where: { id: createDto.successorId },
    });

    if (!predecessor || !successor) {
      throw new NotFoundException('Görevlerden biri veya her ikisi bulunamadı');
    }

    const isCircular = await this.checkCircularDependency(
      predecessor.id,
      successor.id,
    );
    if (isCircular) {
      throw new BadRequestException(
        'Döngüsel bağımlılık tespit edildi! Bu işlem sistemde kilitlenmeye yol açar',
      );
    }

    const dependency = this.taskDependencyRepository.create({
      predecessor,
      successor,
      type: createDto.type,
    });
    const savedDependency =
      await this.taskDependencyRepository.save(dependency);
    if (predecessor.project?.id) {
      this.eventEmitter.emit('task.updated', {
        projectId: predecessor.project.id,
      });
    }
    return savedDependency;
  }

  private async checkCircularDependency(
    predecessorId: string,
    successorId: string,
  ): Promise<boolean> {
    const visited = new Set<string>();
    const queue: string[] = [successorId];

    while (queue.length > 0) {
      const currentId = queue.shift();

      if (!currentId) continue;

      if (currentId === predecessorId) {
        return true;
      }

      if (!visited.has(currentId)) {
        visited.add(currentId);

        const dependencies = await this.taskDependencyRepository.find({
          where: { predecessor: { id: currentId } },
          relations: { successor: true },
        });
        for (const dep of dependencies) {
          queue.push(dep.successor.id);
        }
      }
    }
    return false;
  }

  async updateTask(id: string, updateData: any) {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: { project: true },
    });

    if (!task) throw new NotFoundException('Görev bulunamadı');

    this.validateTaskDateAndMetrics(
      updateData.startDate ? new Date(updateData.startDate) : task.startDate,
      updateData.plannedEndDate
        ? new Date(updateData.plannedEndDate)
        : task.plannedEndDate,
      updateData.estimatedHours !== undefined
        ? updateData.estimatedHours
        : task.estimatedHours,
      updateData.quantity !== undefined ? updateData.quantity : task.quantity,
    );

    Object.assign(task, updateData);
    const updatedTask = await this.taskRepository.save(task);

    if (updatedTask.project?.id) {
      this.eventEmitter.emit('task.updated', {
        projectId: updatedTask.project.id,
      });
    }
    return updatedTask;
  }

  async updateTaskStatus(taskId: string, newStatus: TaskStatus) {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: { project: true },
    });

    if (!task) throw new NotFoundException('Görev Bulunamadı');

    if (newStatus === TaskStatus.IN_PROGRESS) {
      const dependencies = await this.taskDependencyRepository.find({
        where: { successor: { id: taskId } },
        relations: { predecessor: true },
      });

      const uncompletedPrerequisites = dependencies.filter(
        (dep) => dep.predecessor.status !== TaskStatus.COMPLETED,
      );

      if (uncompletedPrerequisites.length > 0) {
        task.status = TaskStatus.BLOCKED;
        await this.taskRepository.save(task);

        if (task.project?.id) {
          this.eventEmitter.emit('task.updated', {
            projectId: task.project.id,
          });
        }

        throw new BadRequestException(
          'Bu göreve başlayamazsınız, önce tamamlanması gereken öncül görevler var. Görev BLOCKED durumuna alındı',
        );
      }

      task.actualStartDate = new Date();
    }

    if (newStatus === TaskStatus.COMPLETED) {
      task.actualEndDate = new Date();
    }

    task.status = newStatus;
    const savedTask = await this.taskRepository.save(task);

    if (savedTask.project?.id) {
      this.eventEmitter.emit('task.updated', {
        projectId: savedTask.project.id,
      });
    }

    return savedTask;
  }

  async updateAssignees(taskId: string, userIds: string[]) {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: { project: true },
    });

    if (!task) throw new NotFoundException('Görev bulunamadı');

    const users = userIds.length
      ? await this.userRepository.findBy({ id: In(userIds) })
      : [];

    if (users.length !== userIds.length) {
      throw new BadRequestException(
        'Seçilen personellerden biri veya birkaçı bulunamadı.',
      );
    }

    task.assignedUsers = users;

    const savedTask = await this.taskRepository.save(task);

    if (savedTask.project?.id) {
      this.eventEmitter.emit('task.updated', { projectId: savedTask.project.id });
    }

    return savedTask;
  }

  validateTaskDateAndMetrics(
    startDate?: Date,
    endDate?: Date,
    estimatedHours?: number,
    quantity?: number,
  ) {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      throw new BadRequestException(
        'Başlangıç tarihi bitiş tarihinden sonra olamaz',
      );
    }
    if (estimatedHours !== undefined && estimatedHours < 0) {
      throw new BadRequestException('tahmini süre negatif olamaz');
    }
    if (quantity !== undefined && quantity < 0) {
      throw new BadRequestException('Miktar (quantity) negatif olamaz');
    }
  }

  async create(createTaskDto: CreateTaskDto) {
    const { assignedUserIds, ...taskData } = createTaskDto;
    this.validateTaskDateAndMetrics(
      createTaskDto.startDate ? new Date(createTaskDto.startDate) : undefined,
      createTaskDto.plannedEndDate
        ? new Date(createTaskDto.plannedEndDate)
        : undefined,
      createTaskDto.estimatedHours,
      createTaskDto.quantity,
    );

    const task = this.taskRepository.create({
      ...taskData,
      project: { id: createTaskDto.projectId },
      ship: { id: createTaskDto.shipId },
      shipArea: createTaskDto.shipAreaId
        ? { id: createTaskDto.shipAreaId }
        : undefined,
      assignedUsers: assignedUserIds?.map((id) => ({ id })),
    });
    const savedTask = await this.taskRepository.save(task);
    this.eventEmitter.emit('task.updated', {
      projectId: createTaskDto.projectId,
    });
    return savedTask;
  }

  async findAll() {
    return this.taskRepository.find({
      relations: {
        project: true,
        ship: true,
        shipArea: true,
        assignedUsers: true,
        assignedTeams: true,
        resources: { resource: true },
      },
    });
  }

  async findDependenciesByProject(projectId: string) {
    return this.taskDependencyRepository.find({
      where: { predecessor: { project: { id: projectId } } },
      relations: { predecessor: true, successor: true },
    });
  }

  async assignResourceToTask(
    taskId: string,
    resourceId: string,
    requestedQuantity: number,
  ) {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: { project: true },
    });
    const resource = await this.resourceRepository.findOne({
      where: { id: resourceId },
    });
    if (!task) {
      throw new NotFoundException('Görev bulunamadı.');
    }
    if (!resource) {
      throw new NotFoundException('Kaynak bulunamadı.');
    }

    if (!task.startDate || !task.plannedEndDate) {
      throw new BadRequestException(
        'Tarihleri belli olmayan bir göreve kaynak rezerve edilemez',
      );
    }

    const overlappingTasks = await this.taskRepository
      .createQueryBuilder('task')
      .innerJoin('task.resources', 'tr')
      .where('tr.resourceId = :resourceId', { resourceId })
      .andWhere('task.startDate <= :endDate', { endDate: task.plannedEndDate })
      .andWhere('task.plannedEndDate >= :startDate', {
        startDate: task.startDate,
      })
      .andWhere('task.id != :taskId', { taskId })
      .select(['task.id', 'tr.allocatedQuantity'])
      .getRawMany();

    let concurrentUsage = 0;
    for (const ot of overlappingTasks) {
      concurrentUsage += Number(ot.tr_allocatedQuantity);
    }

    if (resource.totalQuantity < concurrentUsage + requestedQuantity) {
      throw new BadRequestException(
        `Kapasite yetersiz! İstenen tarihler arasında bu kaynaktan sistemde yalnızca ${resource.totalQuantity - concurrentUsage} birim boştadır.`,
      );
    }
    const assignment = this.taskResourceRepository.create({
      task,
      resource,
      allocatedQuantity: requestedQuantity,
    });

    const savedAssignment = await this.taskResourceRepository.save(assignment);
    if (task.project?.id) {
      this.eventEmitter.emit('task.updated', { projectId: task.project.id });
    }

    return savedAssignment;
  }

  async getTaskByNameOrId(searchTerm: string) {
    return this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.project', 'project')
      .where('CAST(task.id AS text) = :term OR task.name ILIKE :search', {
        term: searchTerm,
        search: `%${searchTerm}`,
      })
      .getOne();
  }

  async getDelayedTasks(projectId?: string) {
    const query = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.project', 'project')
      .where('task.status != :completed', { completed: TaskStatus.COMPLETED })
      .andWhere('task.status != :cancelled', {
        cancelled: TaskStatus.CANCELLED,
      })
      .andWhere('(task.status = :delayed OR task.plannedEndDate < :now)', {
        delayed: TaskStatus.DELAYED,
        now: new Date(),
      });

    if (projectId) {
      query.andWhere('project.id = :projectId', { projectId });
    }
    return query.getMany();
  }

  async getUserTasks(userName: string) {
    return this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignedUsers', 'assignedUser')
      .leftJoinAndSelect('task.project', 'project')
      .where(
        '(assignedUser.firstName ILIKE :name OR assignedUser.lastName ILIKE :name)',
        { name: `%${userName}%` },
      )
      .getMany();
  }
}
