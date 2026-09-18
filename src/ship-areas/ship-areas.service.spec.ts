import { Test, TestingModule } from '@nestjs/testing';
import { ShipAreasService } from './ship-areas.service';

describe('ShipAreasService', () => {
  let service: ShipAreasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShipAreasService],
    }).compile();

    service = module.get<ShipAreasService>(ShipAreasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
