import { Test, TestingModule } from '@nestjs/testing';
import { AiDatasetController } from './ai-dataset.controller';

describe('AiDatasetController', () => {
  let controller: AiDatasetController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiDatasetController],
    }).compile();

    controller = module.get<AiDatasetController>(AiDatasetController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
