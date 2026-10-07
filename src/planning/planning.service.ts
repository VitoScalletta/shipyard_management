import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../tasks/entities/task.entity';
import { TaskDependency } from '../tasks/entities/task-dependency.entity';
import { TaskStatus } from '../tasks/enums/task-status.enum';
import { promiseHooks } from 'v8';

@Injectable()
export class PlanningService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(TaskDependency)
    private taskDependencyRepository: Repository<TaskDependency>,
  ) {}

  async calculateProjectProgress(projectId: string) {
    const tasks = await this.taskRepository.find({
      where: { project: { id: projectId } },
    });

    if (tasks.length === 0) {
      throw new NotFoundException(
        'Bu projeye ait herhangi bir görev bulunamadı',
      );
    }

    const totalTasks = tasks.length;
    const completedTask = tasks.filter(
      (t) => t.status === TaskStatus.COMPLETED,
    );
    const taskCompletionPercentage = (completedTask.length / totalTasks) * 100;

    let totalEstimatedHours = 0;
    let totalActualHours = 0;
    let delayDurationHours = 0;

    tasks.forEach((task) => {
      totalEstimatedHours += Number(task.estimatedHours || 0);
      totalActualHours += Number(task.actualHours || 0);

      if (
        task.status === TaskStatus.COMPLETED &&
        task.actualEndDate &&
        task.plannedEndDate
      ) {
        const actual = new Date(task.actualEndDate).getTime();
        const planned = new Date(task.plannedEndDate).getTime();

        if (actual > planned) {
          delayDurationHours += (actual - planned) / (1000 * 60 * 60 * 24);
        }
      }
    });

    const scheduleVariance =
      totalEstimatedHours > 0
        ? ((totalActualHours - totalEstimatedHours) / totalEstimatedHours) * 100
        : 0;

    return {
      totalTasks,
      completedTask: completedTask.length,
      taskCompletionPercentage: Number(taskCompletionPercentage.toFixed(2)),
      totalEstimatedHours,
      totalActualHours,
      scheduleVariancePercentage: Number(scheduleVariance.toFixed(2)),
      delayDurationHours: Number(delayDurationHours.toFixed(1)),
      remainigHours: Math.max(0, totalEstimatedHours - totalActualHours),
    };
  }

  async calculateTeamWorkLoad(teamId: string) {
    const tasks = await this.taskRepository
      .createQueryBuilder('task')
      .innerJoin('task.assignedTeams', 'teams')
      .where('team.id = :teamId', { teamId })
      .andWhere('task.status NOT IN (:...statuses)', {
        statuses: [TaskStatus.COMPLETED, TaskStatus.CANCELLED],
      })
      .getMany();

    let totalRemainingWorkloadHours = 0;

    tasks.forEach((task) => {
      const estimated = Number(task.estimatedHours || 0);
      const actual = Number(task.actualHours || 0);

      totalRemainingWorkloadHours += Math.max(0, estimated - actual);
    });

    return {
      activeTaskCount: tasks.length,
      totalRemainingWorkloadHours,
    };
  }

  async calculatedCriticalPath(projectId: string) {
    const tasks = await this.taskRepository.find({
      where: { project: { id: projectId } },
    });

    if (!tasks || tasks.length === 0) {
      return {
        projectDurationHours: 0,
        criticalTasks: [],
        message: 'Projeye ait görev bulunamadı.',
      };
    }

    const dependencies = await this.taskDependencyRepository
      .createQueryBuilder('dep')
      .innerJoinAndSelect('dep.predecessor', 'pred')
      .innerJoinAndSelect('dep.successor', 'succ')
      .where('pred.projectId = :projectId', { projectId })
      .getMany();

    const adj = new Map<string, string[]>();
    const revAdj = new Map<string, string[]>();
    const inDegree = new Map<string, number>();
    const durations = new Map<string, number>();

    tasks.forEach((t) => {
      adj.set(t.id, []);
      revAdj.set(t.id, []);
      inDegree.set(t.id, 0);
      durations.set(t.id, Number(t.estimatedHours || 0));
    });

    dependencies.forEach((dep) => {
      const predId = dep.predecessor.id;
      const succId = dep.successor.id;
      if (adj.has(predId) && adj.has(succId)) {
        adj.get(predId)!.push(succId);
        revAdj.get(succId)!.push(predId);
        inDegree.set(succId, inDegree.get(succId)! + 1);
      }
    });

    const topo: string[] = [];
    const queue: string[] = [];

    inDegree.forEach((degree, id) => {
      if (degree === 0) queue.push(id);
    });

    while (queue.length > 0) {
      const current = queue.shift()!;
      topo.push(current);

      adj.get(current)!.forEach((succ) => {
        inDegree.set(succ, inDegree.get(succ)! - 1);
        if (inDegree.get(succ) === 0) queue.push(succ);
      });
    }

    const ES = new Map<string, number>(); //Earlist Start
    const EF = new Map<string, number>();

    topo.forEach((node) => {
      const predecessors = revAdj.get(node)!;
      const maxPredecessorEF =
        predecessors.length > 0
          ? Math.max(...predecessors.map((p) => EF.get(p)!))
          : 0;

      ES.set(node, maxPredecessorEF);
      EF.set(node, maxPredecessorEF + durations.get(node)!);
    });

    const projectDuration = Math.max(...Array.from(EF.values()), 0);

    const LS = new Map<string, number>();
    const LF = new Map<string, number>();

    for (let i = topo.length - 1; i >= 0; i--) {
      const node = topo[i];
      const successors = adj.get(node)!;

      let minSuccessorLS = projectDuration;
      if (successors.length > 0) {
        minSuccessorLS = Math.min(...successors.map((s) => LS.get(s)!));
      }
      LF.set(node, minSuccessorLS);
      LS.set(node, minSuccessorLS - durations.get(node)!);
    }

    const criticalTasks: string[] = [];
    const taskDetails = tasks.map((task) => {
      const id = task.id;
      const float = LF.get(id)! - EF.get(id)!;
      const isCritical = float === 0;

      if (isCritical) criticalTasks.push(id);

      return {
        taskId: id,
        taskName: task.name,
        duration: durations.get(id),
        ES: ES.get(id),
        EF: EF.get(id),
        LS: LS.get(id),
        LF: LF.get(id),
        float,
        isCritical,
      };
    });
    return {
      projectDurationHours: projectDuration,
      totalCriticalTasks: criticalTasks.length,
      criticalTasks,
      details: taskDetails,
    };
  }
}
