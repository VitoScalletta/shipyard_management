import { Test, TestingModule } from '@nestjs/testing';
import { PlanningController } from './planning.controller';
import { PlanningService } from './planning.service';

describe('PlanningController', () => {
  let controller: PlanningController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlanningController],
      providers: [
        {
          provide: PlanningService,
          useValue: {
            calculateProjectProgress: jest.fn(),
            calculateTeamWorkLoad: jest.fn(),
            calculatedCriticalPath: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PlanningController>(PlanningController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
