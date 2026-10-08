import { Test, TestingModule } from '@nestjs/testing';
import { ProjectContextService } from './project-context.service';

describe('ProjectContextService', () => {
  let service: ProjectContextService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectContextService],
    }).compile();

    service = module.get<ProjectContextService>(ProjectContextService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
