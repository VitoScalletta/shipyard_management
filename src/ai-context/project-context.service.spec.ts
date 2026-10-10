import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContextSnapshot } from './entities/context-snapshot.entity';
import { Project } from '../projects/entities/project.entity';
import { Task } from '../tasks/entities/task.entity';
import { TaskDependency } from '../tasks/entities/task-dependency.entity';
import { Employee } from '../workforce/entities/employee.entity';
import { Resource } from '../resources/entities/resource.entity';
import { ProjectContextService } from './project-context.service';

describe('ProjectContextService', () => {
  let service: ProjectContextService;
  let snapshotRepository: jest.Mocked<Partial<Repository<ContextSnapshot>>>;
  let projectRepository: jest.Mocked<Partial<Repository<Project>>>;
  let taskRepository: jest.Mocked<Partial<Repository<Task>>>;

  beforeEach(async () => {
    const queryBuilder = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({
        total: '2',
        completed: '1',
        delayed: '0',
        blocked: '1',
      }),
    };
    snapshotRepository = {
      create: jest.fn((snapshot) => snapshot as ContextSnapshot),
      save: jest.fn(),
    };
    projectRepository = {
      findOne: jest.fn().mockResolvedValue({
        plannedDeliveryDate: new Date('2026-12-31'),
        ship: { name: 'Test Ship', loa: 100, beam: 20, draft: 5 },
      }),
    };
    taskRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      find: jest.fn().mockResolvedValue([]),
      count: jest
        .fn()
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(1),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectContextService,
        {
          provide: getRepositoryToken(ContextSnapshot),
          useValue: snapshotRepository,
        },
        {
          provide: getRepositoryToken(Project),
          useValue: projectRepository,
        },
        {
          provide: getRepositoryToken(Task),
          useValue: taskRepository,
        },
        { provide: getRepositoryToken(TaskDependency), useValue: {} },
        { provide: getRepositoryToken(Employee), useValue: { count: jest.fn().mockResolvedValue(3) } },
        {
          provide: getRepositoryToken(Resource),
          useValue: { createQueryBuilder: jest.fn().mockReturnValue(queryBuilder) },
        },
      ],
    }).compile();

    service = module.get<ProjectContextService>(ProjectContextService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('builds context using project, ship, and task fields from the entities', async () => {
    await expect(service.buildContext('project-id')).resolves.toMatchObject({
      ship: {
        name: 'Test Ship',
        length: 100,
        beam: 20,
        draft: 5,
      },
      project: {
        plannedEnd: new Date('2026-12-31'),
        progress: 50,
      },
      tasks: {
        total: 2,
        completed: 1,
        delayed: 0,
        blocked: 1,
      },
    });
  });

  it('throws when the project does not exist', async () => {
    jest.mocked(projectRepository.findOne).mockResolvedValue(null);

    await expect(service.buildContext('missing-project')).rejects.toThrow(
      'Proje bulunamadı',
    );
  });
});
