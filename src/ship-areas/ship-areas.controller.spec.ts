import { Test, TestingModule } from '@nestjs/testing';
import { ShipAreasController } from './ship-areas.controller';
import { ShipAreasService } from './ship-areas.service';

describe('ShipAreasController', () => {
  let controller: ShipAreasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShipAreasController],
      providers: [ShipAreasService],
    }).compile();

    controller = module.get<ShipAreasController>(ShipAreasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
