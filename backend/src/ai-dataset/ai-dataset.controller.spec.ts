import { Test, TestingModule } from '@nestjs/testing';
import { AiDatasetController } from './ai-dataset.controller';
import { AiDatasetService } from './ai-dataset.service';

describe('AiDatasetController', () => {
  let controller: AiDatasetController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiDatasetController],
      providers: [{ provide: AiDatasetService, useValue: {} }],
    }).compile();

    controller = module.get<AiDatasetController>(AiDatasetController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
