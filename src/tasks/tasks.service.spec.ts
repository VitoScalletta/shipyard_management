import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';
import { TaskDependency } from './entities/task-dependency.entity';
import { TaskResource } from './entities/task-resource.entity';
import { Resource } from '../resources/entities/resource.entity';
import { TaskStatus } from './enums/task-status.enum';

describe('TasksService', () => {
  let service: TasksService;

  // QueryBuilder Zinciri Mock'u (Kaynak hesaplamaları için)
  const mockQueryBuilder = {
    innerJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
  };

  const mockTaskRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };

  const mockTaskDependencyRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockTaskResourceRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockResourceRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getRepositoryToken(Task), useValue: mockTaskRepository },
        {
          provide: getRepositoryToken(TaskDependency),
          useValue: mockTaskDependencyRepository,
        },
        {
          provide: getRepositoryToken(TaskResource),
          useValue: mockTaskResourceRepository,
        },
        {
          provide: getRepositoryToken(Resource),
          useValue: mockResourceRepository,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('servis başarıyla tanımlandı', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('başlangıç tarihi bitişten sonraysa hata fırlatmalıdır', async () => {
      const dto = {
        projectId: '1',
        shipId: '1',
        title: 'Test',
        startDate: '2026-10-10',
        plannedEndDate: '2026-10-05',
      } as any;
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('tahmini süre negatifse hata fırlatmalıdır', async () => {
      const dto = {
        projectId: '1',
        shipId: '1',
        title: 'Test',
        estimatedHours: -5,
      } as any;
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('başarılı görev oluşturmalıdır', async () => {
      const dto = { projectId: '1', shipId: '1', title: 'Test Görevi' } as any;
      const expectedTask = { ...dto, project: { id: '1' }, ship: { id: '1' } };
      mockTaskRepository.create.mockReturnValue(expectedTask);
      mockTaskRepository.save.mockResolvedValue(expectedTask);

      const result = await service.create(dto);
      expect(result).toEqual(expectedTask);
      expect(mockTaskRepository.save).toHaveBeenCalledWith(expectedTask);
    });
  });

  describe('addDependency', () => {
    it('görev kendisine bağımlıysa hata fırlatmalıdır', async () => {
      await expect(
        service.addDependency({
          predecessorId: '1',
          successorId: '1',
          type: 'FS',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('görevlerden biri yoksa NotFoundException fırlatmalıdır', async () => {
      mockTaskRepository.findOne.mockResolvedValue(null);
      await expect(
        service.addDependency({
          predecessorId: '1',
          successorId: '2',
          type: 'FS',
        } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('döngüsel bağımlılık (circular) tespit ederse kilitlenmeyi önleyip hata fırlatmalıdır', async () => {
      mockTaskRepository.findOne.mockResolvedValue({ id: '1' });
      mockTaskDependencyRepository.find.mockResolvedValue([
        { successor: { id: '1' } },
      ]);

      await expect(
        service.addDependency({
          predecessorId: '1',
          successorId: '2',
          type: 'FS',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('sorunsuz bağımlılık oluşturmalıdır', async () => {
      mockTaskRepository.findOne
        .mockResolvedValueOnce({ id: '1' })
        .mockResolvedValueOnce({ id: '2' });
      mockTaskDependencyRepository.find.mockResolvedValue([]); // Döngü yok
      mockTaskDependencyRepository.create.mockReturnValue({ id: 'dep1' });
      mockTaskDependencyRepository.save.mockResolvedValue({ id: 'dep1' });

      const result = await service.addDependency({
        predecessorId: '1',
        successorId: '2',
        type: 'FS',
      } as any);
      expect(result).toEqual({ id: 'dep1' });
    });
  });

  describe('updateTaskStatus', () => {
    it('IN_PROGRESS durumuna geçerken, bitmemiş öncül (predecessor) görev varsa BLOCKED yapıp hata fırlatmalıdır', async () => {
      const task = { id: '1', status: TaskStatus.PENDING };
      mockTaskRepository.findOne.mockResolvedValue(task);
      mockTaskDependencyRepository.find.mockResolvedValue([
        { predecessor: { status: TaskStatus.PENDING } },
      ]);

      await expect(
        service.updateTaskStatus('1', TaskStatus.IN_PROGRESS),
      ).rejects.toThrow(BadRequestException);
      expect(task.status).toBe(TaskStatus.BLOCKED);
      expect(mockTaskRepository.save).toHaveBeenCalledWith(task);
    });

    it('COMPLETED yapıldığında actualEndDate atanmalıdır', async () => {
      const task = { id: '1', status: TaskStatus.IN_PROGRESS };
      mockTaskRepository.findOne.mockResolvedValue(task);
      mockTaskRepository.save.mockImplementation(async (t) => t);

      const result = await service.updateTaskStatus('1', TaskStatus.COMPLETED);
      expect(result.status).toBe(TaskStatus.COMPLETED);
      expect(result.actualEndDate).toBeInstanceOf(Date);
    });
  });

  describe('assignResourceToTask', () => {
    it('tarihleri belli olmayan göreve kaynak atanmaya çalışılırsa hata fırlatmalıdır', async () => {
      mockTaskRepository.findOne.mockResolvedValue({
        id: '1',
        startDate: null,
      });
      mockResourceRepository.findOne.mockResolvedValue({ id: 'r1' });

      await expect(service.assignResourceToTask('1', 'r1', 5)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('kaynak kapasitesi yetersizse hata fırlatmalıdır (Örtüşen Görevler Hesaplaması)', async () => {
      mockTaskRepository.findOne.mockResolvedValue({
        id: '1',
        startDate: new Date(),
        plannedEndDate: new Date(),
      });
      mockResourceRepository.findOne.mockResolvedValue({
        id: 'r1',
        totalQuantity: 10,
      });

      mockQueryBuilder.getRawMany.mockResolvedValue([
        { tr_allocatedQuantity: 7 },
      ]);

      await expect(service.assignResourceToTask('1', 'r1', 5)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('kapasite yeterliyse başarıyla atama yapmalıdır', async () => {
      mockTaskRepository.findOne.mockResolvedValue({
        id: '1',
        startDate: new Date(),
        plannedEndDate: new Date(),
      });
      mockResourceRepository.findOne.mockResolvedValue({
        id: 'r1',
        totalQuantity: 10,
      });

      mockQueryBuilder.getRawMany.mockResolvedValue([
        { tr_allocatedQuantity: 2 },
      ]);

      const assignment = {
        task: { id: '1' },
        resource: { id: 'r1' },
        allocatedQuantity: 5,
      };
      mockTaskResourceRepository.create.mockReturnValue(assignment);
      mockTaskResourceRepository.save.mockResolvedValue(assignment);

      const result = await service.assignResourceToTask('1', 'r1', 5);
      expect(result).toEqual(assignment);
    });
  });
});
