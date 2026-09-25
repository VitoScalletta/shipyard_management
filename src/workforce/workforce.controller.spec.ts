import { Test, TestingModule } from '@nestjs/testing';
import { WorkforceController } from './workforce.controller';

describe('WorkforceController', () => {
  let controller: WorkforceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkforceController],
    }).compile();

    controller = module.get<WorkforceController>(WorkforceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
