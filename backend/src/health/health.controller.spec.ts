import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import {
  HealthCheckService,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  HealthIndicatorService,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: { check: jest.fn().mockResolvedValue({ status: 'ok' }) },
        },
        {
          provide: TypeOrmHealthIndicator,
          useValue: { pingCheck: jest.fn() },
        },
        {
          provide: MemoryHealthIndicator,
          useValue: { checkHeap: jest.fn() },
        },
        {
          provide: HealthIndicatorService,
          useValue: {
            check: jest.fn(() => ({
              up: jest.fn(() => ({ ollama: { status: 'up' } })),
              down: jest.fn((message: string) => ({
                ollama: { status: 'down', message },
              })),
            })),
          },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('http://127.0.0.1:11434') },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return liveness status', async () => {
    const result = await controller.checkLiveness();
    expect(result).toEqual({ status: 'ok' });
  });

  it('should return readiness status', async () => {
    const result = await controller.checkReadiness();
    expect(result).toEqual({ status: 'ok' });
  });
});