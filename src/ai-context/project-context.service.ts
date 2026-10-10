import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContextSnapshot } from './entities/context-snapshot.entity';
import { Project } from '../projects/entities/project.entity';
import { Task } from '../tasks/entities/task.entity';
import { TaskDependency } from '../tasks/entities/task-dependency.entity';
import { Employee } from '../workforce/entities/employee.entity';
import { Resource } from '../resources/entities/resource.entity';
import { TaskStatus } from 'src/tasks/enums/task-status.enum';

@Injectable()
export class ProjectContextService {
  constructor(
    @InjectRepository(ContextSnapshot)
    private readonly snapshotRepository: Repository<ContextSnapshot>,

    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    @InjectRepository(TaskDependency)
    private readonly taskDependencyRepository: Repository<TaskDependency>,

    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,

    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>,
  ) {}

  async buildContext(projectId: string) {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: { ship: true },
    });

    if (!project) throw new NotFoundException('Proje bulunamadı');

    const taskStats = await this.taskRepository
      .createQueryBuilder('task')
      .select('COUNT(task.id)', 'total')
      .addSelect(
        `SUM(CASE WHEN task.status = 'COMPLETED' THEN 1 ELSE 0 END)`,
        'completed',
      )
      .addSelect(
        `SUM(CASE WHEN task.status = 'DELAYED' THEN 1 ELSE 0 END)`,
        'delayed',
      )
      .addSelect(
        `SUM(CASE WHEN task.status = 'BLOCKED' THEN 1 ELSE 0 END)`,
        'blocked',
      )
      .where('task.projectId = :projectId', { projectId })
      .getRawOne();

    const availableWorkers = await this.employeeRepository.count();
    const requiredWorkers = await this.taskRepository.count({
      where: { project: { id: projectId }, status: TaskStatus.IN_PROGRESS },
    });

    const resourceStats = await this.resourceRepository
      .createQueryBuilder('resource')
      .select('COUNT(resource.id)', 'total')
      .addSelect(
        `SUM(CASE WHEN resource.status = 'AVAILABLE' THEN 1 ELSE 0 END)`,
        'available',
      )
      .addSelect(
        `SUM(CASE WHEN resource.status = 'IN_USE' THEN 1 ELSE 0 END)`,
        'inUse',
      )
      .addSelect(
        `SUM(CASE WHEN resource.status = 'MAINTENANCE' THEN 1 ELSE 0 END)`,
        'maintenance',
      )
      .getRawOne();

    const criticalPath = await this.calculateCriticalPath(projectId);

    const structuredContext = {
      ship: {
        name: project.ship?.name,
        length: project.ship?.loa,
        beam: project.ship?.beam,
        draft: project.ship?.draft,
      },
      project: {
        plannedEnd: project.plannedDeliveryDate,
        progress: await this.calculateProjectProgress(projectId),
      },
      tasks: {
        total: Number(taskStats.total || 0),
        completed: Number(taskStats.completed || 0),
        delayed: Number(taskStats.delayed || 0),
        blocked: Number(taskStats.blocked || 0),
      },
      workforce: {
        availableWorkers,
        requiredWorkers,
      },
      resources: {
        total: Number(resourceStats.total || 0),
        available: Number(resourceStats.available || 0),
        inUse: Number(resourceStats.inUse || 0),
        maintenance: Number(resourceStats.maintenance || 0),
      },
      criticalPath,
    };

    return structuredContext;
  }

  async saveSnapshot(projectId: string, contextData: any, analysisId?: string) {
    const snapshot = this.snapshotRepository.create({
      projectId,
      contextData,
      analysisId,
    });
    return await this.snapshotRepository.save(snapshot);
  }

  private async calculateProjectProgress(projectId: string): Promise<number> {
    const total = await this.taskRepository.count({
      where: { project: { id: projectId } },
    });
    const completed = await this.taskRepository.count({
      where: { project: { id: projectId }, status: TaskStatus.COMPLETED },
    });
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  }

  private async calculateCriticalPath(projectId: string): Promise<any[]> {
    const bottleneckTasks = await this.taskRepository.find({
      where: [
        { project: { id: projectId }, status: TaskStatus.DELAYED },
        { project: { id: projectId }, status: TaskStatus.BLOCKED },
      ],
      select: {
        id: true,
        name: true,
        status: true,
        startDate: true,
        plannedEndDate: true,
      },
    });

    return bottleneckTasks;
  }
}
