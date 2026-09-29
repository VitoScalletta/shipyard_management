import { CreateTaskDto } from './dto/create-task.dto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Repository } from 'typeorm';
import { TaskDependency } from './entities/task-dependency.entity';
import { CreateTaskDependencyDto } from './dto/create-task-dependency.dto';
import { TaskStatus } from './enums/task-status.enum';
import { TaskResource } from './entities/task-resource.entity';
import { Resource } from '../resources/entities/resource.entity';

@Injectable()
export class TasksService {
  constructor(
  @InjectRepository(Task)
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(TaskDependency)
    private taskDependencyRepository: Repository<TaskDependency>,
    @InjectRepository(TaskResource)
    private taskResourceRepository: Repository<TaskResource>,
    @InjectRepository(Resource)
    private resourceRepository: Repository<Resource>,
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

    return this.taskDependencyRepository.save(dependency);
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

  async updateTaskStatus(taskId: string, newStatus: TaskStatus) {
    const task = await this.taskRepository.findOne({ where: { id: taskId } });
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

        throw new BadRequestException(
          'bu göreve başlayamazsınız önce tamamlanması gereken öncül görevler var. Görev BLOCKED durumuna alındı',
        );
      }

      task.actualStartDate = new Date();
    }

    if (newStatus === TaskStatus.COMPLETED) {
      task.actualEndDate = new Date();
    }

    task.status = newStatus;
    return this.taskRepository.save(task);
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
    this.validateTaskDateAndMetrics(
      createTaskDto.startDate ? new Date(createTaskDto.startDate) : undefined,
      createTaskDto.plannedEndDate
        ? new Date(createTaskDto.plannedEndDate)
        : undefined,
      createTaskDto.estimatedHours,
      createTaskDto.quantity,
    );

    const task = this.taskRepository.create({
      ...createTaskDto,
      project: { id: createTaskDto.projectId },
      ship: { id: createTaskDto.shipId },
      shipArea: createTaskDto.shipAreaId
        ? { id: createTaskDto.shipAreaId }
        : undefined,
    });
    return this.taskRepository.save(task);
  }

  async findAll() {
    return this.taskRepository.find({
      relations: {
        project: true,
        ship: true,
        shipArea: true,
        assignedUsers: true,
      },
    });
  }

  async assignResourceToTask(
    taskId: string,
    resourceId: string,
    requestedQuantity: number,
  ) {
    const task = await this.taskRepository.findOne({ where: { id: taskId } });
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

    if(resource.totalQuantity < (concurrentUsage + requestedQuantity)){
      throw new BadRequestException(
        `Kapasite yetersiz! İstenen tarihler arasında bu kaynaktan sistemde yalnızca ${resource.totalQuantity - concurrentUsage} birim boştadır.`
      );
    }

    const assignment = this.taskResourceRepository.create({
      task,
      resource,
      allocatedQuantity: requestedQuantity,
    });

    return this.taskResourceRepository.save(assignment);
  }
}
