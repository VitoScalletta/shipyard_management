import { Test, TestingModule } from '@nestjs/testing';
import { WorkforceService } from './workforce.service';

describe('WorkforceService', () => {
  let service: WorkforceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkforceService],
    }).compile();

    service = module.get<WorkforceService>(WorkforceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
