import { Test, TestingModule } from '@nestjs/testing';
import { GarsonAiService } from './garson-ai.service';
import { TasksService } from '../tasks/tasks.service';
import { AiOrchestratorService } from '../ai-orchestrator/ai-orchestrator.service';
import { AiDatasetService } from '../ai-dataset/ai-dataset.service';

describe('GarsonAiService', () => {
  let service: GarsonAiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
          provide: AiDatasetService,
          useValue: {
            createLog: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<GarsonAiService>(GarsonAiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
