import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkforceService } from './workforce.service';
import { Employee } from './entities/employee.entity';
import { Team } from './entities/team.entity';

describe('WorkforceService', () => {
  let service: WorkforceService;

  const mockEmployeeRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  } as Partial<Repository<Employee>>;

  const mockTeamRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  } as Partial<Repository<Team>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkforceService,
        {
          provide: getRepositoryToken(Employee),
          useValue: mockEmployeeRepository,
        },
        {
          provide: getRepositoryToken(Team),
          useValue: mockTeamRepository,
        },
      ],
    }).compile();

    service = module.get<WorkforceService>(WorkforceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
