import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';
import { TaskDependency } from './entities/task-dependency.entity';
import { TaskResource } from './entities/task-resource.entity';
import { Resource } from '../resources/entities/resource.entity';
import { User } from '../users/entities/user.entity';
import { TaskStatus } from './enums/task-status.enum';

describe('TasksService', () => {
  let service: TasksService;

  // QueryBuilder Zinciri Mock'u (Kaynak hesaplamaları için)
  const mockQueryBuilder = {
    innerJoin: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
    getMany: jest.fn(),
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

  const mockUserRepository = {
    findBy: jest.fn(),
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
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
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

    it('görev oluştururken atanmış kullanıcı ilişkilerini kaydetmelidir', async () => {
      const expectedTask = { id: 'task-id' };
      mockTaskRepository.create.mockReturnValue(expectedTask);
      mockTaskRepository.save.mockResolvedValue(expectedTask);

      await service.create({
        projectId: 'project-id',
        shipId: 'ship-id',
        name: 'Personel atanmış görev',
        assignedUserIds: ['user-id'],
      } as any);

      expect(mockTaskRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          assignedUsers: [{ id: 'user-id' }],
          project: { id: 'project-id' },
          ship: { id: 'ship-id' },
        }),
      );
    });
  });

  describe('getUserTasks', () => {
    it('matches first and last names using a safe alias and partial name', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await service.getUserTasks('Jokey');

      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'task.assignedUsers',
        'assignedUser',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        '(assignedUser.firstName ILIKE :name OR assignedUser.lastName ILIKE :name)',
        { name: '%Jokey%' },
      );
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
    });
  });

  describe('getDelayedTasks', () => {
    it('includes tasks explicitly marked delayed and excludes completed or cancelled tasks', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await service.getDelayedTasks();

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'task.status != :completed',
        { completed: TaskStatus.COMPLETED },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'task.status != :cancelled',
        { cancelled: TaskStatus.CANCELLED },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(task.status = :delayed OR task.plannedEndDate < :now)',
        expect.objectContaining({ delayed: TaskStatus.DELAYED }),
      );
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
    });

    it('filters delayed tasks by project when a project ID is provided', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await service.getDelayedTasks('project-1');

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'project.id = :projectId',
        { projectId: 'project-1' },
      );
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

  describe('updateAssignees', () => {
    it('göreve seçili personelleri atayıp proje güncelleme olayı yayınlar', async () => {
      const task = { id: 'task-1', project: { id: 'project-1' }, assignedUsers: [] };
      const users = [{ id: 'user-1' }, { id: 'user-2' }];
      mockTaskRepository.findOne.mockResolvedValue(task);
      mockUserRepository.findBy.mockResolvedValue(users);
      mockTaskRepository.save.mockResolvedValue({ ...task, assignedUsers: users });

      const result = await service.updateAssignees('task-1', ['user-1', 'user-2']);

      expect(result.assignedUsers).toEqual(users);
      expect(mockTaskRepository.save).toHaveBeenCalledWith({ ...task, assignedUsers: users });
    });

    it('olmayan personel seçildiğinde hata döndürür', async () => {
      mockTaskRepository.findOne.mockResolvedValue({ id: 'task-1', project: { id: 'project-1' } });
      mockUserRepository.findBy.mockResolvedValue([{ id: 'user-1' }]);

      await expect(service.updateAssignees('task-1', ['user-1', 'user-2'])).rejects.toThrow(BadRequestException);
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
