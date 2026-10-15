import { Test, TestingModule } from '@nestjs/testing';
import { GarsonAiController } from './garson-ai.controller';
import { GarsonAiService } from './garson-ai.service';

describe('GarsonAiController', () => {
  let controller: GarsonAiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GarsonAiController],
      providers: [
        {
          provide: GarsonAiService,
          useValue: {
            processUserMessage: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<GarsonAiController>(GarsonAiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
