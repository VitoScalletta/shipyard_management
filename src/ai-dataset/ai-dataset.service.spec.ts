import { Test, TestingModule } from '@nestjs/testing';
import { AiDatasetService } from './ai-dataset.service';

describe('AiDatasetService', () => {
  let service: AiDatasetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiDatasetService],
    }).compile();

    service = module.get<AiDatasetService>(AiDatasetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
