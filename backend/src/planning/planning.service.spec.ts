import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { PlanningService } from './planning.service';
import { Task } from '../tasks/entities/task.entity';
import { TaskDependency } from '../tasks/entities/task-dependency.entity';
import { TaskStatus } from '../tasks/enums/task-status.enum';

describe('PlanningService', () => {
  let service: PlanningService;

  const mockQueryBuilder = {
    innerJoin: jest.fn().mockReturnThis(),
    innerJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  const mockTaskRepository = {
    find: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };

  const mockTaskDependencyRepository = {
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanningService,
        { provide: getRepositoryToken(Task), useValue: mockTaskRepository },
        { provide: getRepositoryToken(TaskDependency), useValue: mockTaskDependencyRepository },
      ],
    }).compile();

    service = module.get<PlanningService>(PlanningService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('servis başarıyla tanımlandı', () => {
    expect(service).toBeDefined();
  });

  describe('calculateProjectProgress', () => {
    it('görev bulunamazsa NotFoundException fırlatmalıdır', async () => {
      mockTaskRepository.find.mockResolvedValue([]);
      await expect(service.calculateProjectProgress('1')).rejects.toThrow(NotFoundException);
    });

    it('proje ilerlemesini, gecikmeleri ve varyansları doğru hesaplamalıdır', async () => {
      const now = new Date();
      const past = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

      mockTaskRepository.find.mockResolvedValue([
        { status: TaskStatus.COMPLETED, estimatedHours: 10, actualHours: 12, plannedEndDate: past, actualEndDate: now },
        { status: TaskStatus.IN_PROGRESS, estimatedHours: 20, actualHours: 5 },
      ]);

      const result = await service.calculateProjectProgress('1');

      expect(result.totalTasks).toBe(2);
      expect(result.completedTask).toBe(1);
      expect(result.taskCompletionPercentage).toBe(50);
      expect(result.totalEstimatedHours).toBe(30);
      expect(result.totalActualHours).toBe(17);
      expect(result.delayDurationHours).toBe(2);
      expect(result.remainigHours).toBe(13);
    });
  });

  describe('calculateTeamWorkLoad', () => {
    it('takım iş yükünü doğru hesaplamalıdır', async () => {
      mockQueryBuilder.getMany.mockResolvedValueOnce([
        { estimatedHours: 10, actualHours: 4 },
        { estimatedHours: 5, actualHours: 5 },
      ]);

      const result = await service.calculateTeamWorkLoad('team1');

      expect(result.activeTaskCount).toBe(2);
      expect(result.totalRemainingWorkloadHours).toBe(6);
    });
  });

  describe('calculatedCriticalPath', () => {
    it('görev yoksa sıfırlanmış boş değerler dönmelidir', async () => {
      mockTaskRepository.find.mockResolvedValue([]);
      const result = await service.calculatedCriticalPath('1');
      expect(result.projectDurationHours).toBe(0);
      expect(result.criticalTasks).toEqual([]);
    });

    it('kritik yolu (Critical Path) ve proje süresini doğru hesaplamalıdır', async () => {
      mockTaskRepository.find.mockResolvedValue([
        { id: 'task1', name: 'A', estimatedHours: 10 },
        { id: 'task2', name: 'B', estimatedHours: 20 },
      ]);

      mockQueryBuilder.getMany.mockResolvedValueOnce([
        { predecessor: { id: 'task1' }, successor: { id: 'task2' } }
      ]);

      const result = await service.calculatedCriticalPath('1');

      expect(result.projectDurationHours).toBe(30);
      expect(result.totalCriticalTasks).toBe(2);
      expect(result.criticalTasks).toContain('task1');
      expect(result.criticalTasks).toContain('task2');
    });
  });
});