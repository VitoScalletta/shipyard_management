import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ShipAreasService } from './ship-areas.service';
import { ShipArea } from './entities/ship-area.entity';

describe('ShipAreasService', () => {
  let service: ShipAreasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShipAreasService,
        { provide: getRepositoryToken(ShipArea), useValue: {} },
      ],
    }).compile();

    service = module.get<ShipAreasService>(ShipAreasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});