import { Test, TestingModule } from '@nestjs/testing';
import { WorkforceController } from './workforce.controller';
import { WorkforceService } from './workforce.service';

describe('WorkforceController', () => {
  let controller: WorkforceController;

  const mockWorkforceService = {
    createEmployee: jest.fn(),
    findAllEmployess: jest.fn(),
    findOneEmployee: jest.fn(),
    updateEmployee: jest.fn(),
    createTeam: jest.fn(),
    findAllTeams: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkforceController],
      providers: [
        {
          provide: WorkforceService,
          useValue: mockWorkforceService,
        },
      ],
    }).compile();

    controller = module.get<WorkforceController>(WorkforceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
