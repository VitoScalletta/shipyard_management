import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AiDatasetService } from './ai-dataset.service';
import { AiTrainingDataset } from './entities/ai-training-dataset.entity';

describe('AiDatasetService', () => {
  let service: AiDatasetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiDatasetService,
        { provide: getRepositoryToken(AiTrainingDataset), useValue: {} },
      ],
    }).compile();

    service = module.get<AiDatasetService>(AiDatasetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});