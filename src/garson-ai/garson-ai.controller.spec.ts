import { Test, TestingModule } from '@nestjs/testing';
import { GarsonAiController } from './garson-ai.controller';

describe('GarsonAiController', () => {
  let controller: GarsonAiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GarsonAiController],
    }).compile();

    controller = module.get<GarsonAiController>(GarsonAiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
