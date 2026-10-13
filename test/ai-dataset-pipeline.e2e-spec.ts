import { INestApplication, ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { AiDatasetController } from '../src/ai-dataset/ai-dataset.controller';
import { AiDatasetService } from '../src/ai-dataset/ai-dataset.service';
import { AiTrainingDataset } from '../src/ai-dataset/entities/ai-training-dataset.entity';
import { AiOrchestratorService } from '../src/ai-orchestrator/ai-orchestrator.service';
import { GarsonAiController } from '../src/garson-ai/garson-ai.controller';
import { GarsonAiService } from '../src/garson-ai/garson-ai.service';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { TasksService } from '../src/tasks/tasks.service';

describe('AI dataset pipeline (e2e)', () => {
  let app: INestApplication;
  let datasets: Map<string, Partial<AiTrainingDataset>>;
  let nextId: number;
  let queryPredicates: Array<(dataset: Partial<AiTrainingDataset>) => boolean>;
  let savedLog: Partial<AiTrainingDataset> | undefined;

  const queryBuilder = {
    andWhere: jest.fn((condition: string, parameters?: Record<string, unknown>) => {
      if (condition === 'dataset.agentType = :agentType') {
        queryPredicates.push((dataset) => dataset.agentType === parameters?.agentType);
      } else if (condition === 'dataset.modelName = :modelName') {
        queryPredicates.push((dataset) => dataset.modelName === parameters?.modelName);
      } else if (condition === 'dataset.createdAt >= :startDate') {
        queryPredicates.push(
          (dataset) => new Date(dataset.createdAt!) >= new Date(String(parameters?.startDate)),
        );
      } else if (condition === 'dataset.createdAt <= :endDate') {
        queryPredicates.push(
          (dataset) => new Date(dataset.createdAt!) <= new Date(String(parameters?.endDate)),
        );
      } else if (condition === 'dataset.humanFeedback = true') {
        queryPredicates.push((dataset) => dataset.humanFeedback === true);
      } else if (condition === 'dataset.humanFeedback = false') {
        queryPredicates.push((dataset) => dataset.humanFeedback === false);
      }

      return queryBuilder;
    }),
    getMany: jest.fn(async () =>
      [...datasets.values()].filter((dataset) =>
        queryPredicates.every((predicate) => predicate(dataset)),
      ),
    ),
  };

  const datasetRepository = {
    create: jest.fn((data: Partial<AiTrainingDataset>) => ({
      id: `dataset-${nextId++}`,
      createdAt: new Date(),
      ...data,
    })),
    save: jest.fn(async (dataset: Partial<AiTrainingDataset>) => {
      datasets.set(dataset.id!, dataset);
      savedLog = dataset;
      return dataset;
    }),
    findOne: jest.fn(async ({ where }: { where: { id: string } }) =>
      datasets.get(where.id) ?? null,
    ),
    createQueryBuilder: jest.fn(() => {
      queryPredicates = [];
      return queryBuilder;
    }),
  };

  const withColoredStatus = async <T>(
    step: string,
    run: () => Promise<T>,
  ): Promise<T> => {
    try {
      const result = await run();
      console.log(`\x1b[32m[BAŞARILI] ${step}\x1b[0m`);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`\x1b[31m[BAŞARISIZ] ${step}: ${message}\x1b[0m`);
      throw error;
    }
  };

  beforeAll(async () => {
    datasets = new Map();
    nextId = 1;
    queryPredicates = [];

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [GarsonAiController, AiDatasetController],
      providers: [
        GarsonAiService,
        AiDatasetService,
        JwtAuthGuard,
        { provide: TasksService, useValue: {} },
        {
          provide: AiOrchestratorService,
          useValue: {
            routeToChatModel: jest.fn().mockResolvedValue({
              content: 'Geciken görevler kontrol edildi.',
              tool_calls: [],
            }),
          },
        },
        {
          provide: getRepositoryToken(AiTrainingDataset),
          useValue: datasetRepository,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          context.switchToHttp().getRequest().user = {
            id: 'e2e-user',
            role: 'ADMIN',
          };
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('chat logunu kaydeder, feedback günceller ve JSONL export eder', async () => {
    const datasetId = await withColoredStatus('Garson chat ve dataset log kaydı', async () => {
      const chatResponse = await request(app.getHttpServer())
        .post('/garson/chat')
        .set('Authorization', 'Bearer test-token')
        .send({ message: 'Bana geciken görevleri getir' });

      expect(chatResponse.status).toBe(201);
      expect(chatResponse.body.success).toBe(true);
      expect(chatResponse.body.data).toMatchObject({
        type: 'text',
        content: 'Geciken görevler kontrol edildi.',
      });

      await new Promise<void>((resolve) => setImmediate(resolve));
      expect(datasetRepository.save).toHaveBeenCalledTimes(1);
      expect(savedLog).toMatchObject({
        agentType: 'GARSON',
        userPrompt: 'Bana geciken görevleri getir',
      });
      expect(savedLog?.id).toBeDefined();

      return savedLog!.id!;
    });

    await withColoredStatus('Dataset feedback güncellemesi', async () => {
      const feedbackResponse = await request(app.getHttpServer())
        .post(`/ai-dataset/feedback/${datasetId}`)
        .send({ isHelpful: true, comment: 'Çok iyi bir cevap' });

      expect(feedbackResponse.status).toBe(201);
      expect(feedbackResponse.body.success).toBe(true);
      expect(datasets.get(datasetId)).toMatchObject({
        humanFeedback: true,
        feedbackComment: 'Çok iyi bir cevap',
      });
    });

    await withColoredStatus('Pozitif feedback JSONL export', async () => {
      const exportResponse = await request(app.getHttpServer()).get(
        '/ai-dataset/export?agentType=GARSON&feedback=POSITIVE',
      );

      expect(exportResponse.status).toBe(200);
      expect(exportResponse.headers['content-type']).toContain(
        'application/jsonlines+json',
      );
      expect(typeof exportResponse.text).toBe('string');

      const exportedRows = exportResponse.text
        .trim()
        .split('\n')
        .map((line: string) => JSON.parse(line));
      expect(exportedRows).toHaveLength(1);
      expect(exportedRows[0]).toMatchObject({
        messages: [
          { role: 'system', content: expect.stringContaining('Garson AI') },
          { role: 'user', content: 'Bana geciken görevleri getir' },
          { role: 'assistant', content: 'Geciken görevler kontrol edildi.' },
        ],
        metadata: { agent: 'GARSON', isHelpful: true },
      });
    });
  });
});