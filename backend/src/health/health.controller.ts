import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  HealthIndicatorService,
} from '@nestjs/terminus';
import type { HealthIndicatorResult } from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    private healthIndicator: HealthIndicatorService,
    private configService: ConfigService,
  ) {}

  @Get('liveness')
  @HealthCheck()
  checkLiveness() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 512 * 1024 * 1024),
    ]);
  }

  @Get('readiness')
  @HealthCheck()
  checkReadiness() {
    return this.health.check([
      () => this.db.pingCheck('database', { timeout: 3000 }),

      async (): Promise<HealthIndicatorResult> => {
        const baseUrl =
          this.configService.get<string>('OLLAMA_URL') ||
          'http://127.0.0.1:11434';

        try {
          const response = await fetch(`${baseUrl}/api/tags`, {
            signal: AbortSignal.timeout(3000),
          });

          if (!response.ok) {
            return this.healthIndicator
              .check('ollama')
              .down(`HTTP Status ${response.status}`);
          }

          return this.healthIndicator.check('ollama').up();
        } catch (error) {
          return this.healthIndicator
            .check('ollama')
            .down(error instanceof Error ? error.message : 'unknown error');
        }
      },
    ]);
  }
}
