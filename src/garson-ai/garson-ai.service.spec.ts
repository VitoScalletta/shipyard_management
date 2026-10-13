import { Test, TestingModule } from '@nestjs/testing';
import { GarsonAiService } from './garson-ai.service';

describe('GarsonAiService', () => {
  let service: GarsonAiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GarsonAiService],
    }).compile();

    service = module.get<GarsonAiService>(GarsonAiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
