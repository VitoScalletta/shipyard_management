import { Test, TestingModule } from '@nestjs/testing';
import { GarsonAiService } from './garson-ai.service';
import { TasksService } from '../tasks/tasks.service';
import { AiOrchestratorService } from '../ai-orchestrator/ai-orchestrator.service';
import { AiDatasetService } from '../ai-dataset/ai-dataset.service';
import { ProjectsService } from '../projects/projects.service';

describe('GarsonAiService', () => {
  let service: GarsonAiService;
  let testingModule: TestingModule;

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      providers: [
        GarsonAiService,
        {
          provide: TasksService,
          useValue: {
            getDelayedTasks: jest.fn(),
            getUserTasks: jest.fn(),
            getTaskByNameOrId: jest.fn(),
            updateTaskStatus: jest.fn(),
          },
        },
        {
          provide: AiOrchestratorService,
          useValue: {
            routeToChatModel: jest.fn().mockResolvedValue({ content: 'Merhaba' }),
          },
        },
        {
          provide: ProjectsService,
          useValue: {
            findAll: jest.fn(),
          },
        },
        {
          provide: AiDatasetService,
          useValue: {
            createLog: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = testingModule.get<GarsonAiService>(GarsonAiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('lists delayed tasks directly without asking the model to invent a project ID', async () => {
    const tasksService = testingModule.get(TasksService) as jest.Mocked<TasksService>;
    const aiService = testingModule.get(AiOrchestratorService) as jest.Mocked<AiOrchestratorService>;
    tasksService.getDelayedTasks.mockResolvedValue([]);

    await service.processUserMessage('user-1', 'MANAGER', 'Geciken görevleri göster');

    expect(tasksService.getDelayedTasks).toHaveBeenCalledWith(undefined);
    expect(aiService.routeToChatModel).not.toHaveBeenCalled();
  });

  it('returns a summary for active projects without calling the language model', async () => {
    const projectsService = testingModule.get(ProjectsService) as jest.Mocked<ProjectsService>;
    projectsService.findAll.mockResolvedValue([
      { name: 'Yeni Gemi', projectCode: 'PRJ-01', status: 'IN_PROGRESS' },
      { name: 'Tamamlanan Gemi', status: 'COMPLETED' },
    ] as never);

    const result = await service.processUserMessage('user-1', 'MANAGER', 'Aktif projelerin özetini çıkar');

    expect(result).toEqual(expect.objectContaining({
      type: 'project_summary',
      content: expect.objectContaining({
        activeCount: 1,
        projects: [expect.objectContaining({ name: 'Yeni Gemi' })],
      }),
    }));
  });
});
