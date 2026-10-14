import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from '../../metrics/metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    if (request.url?.includes('/metrics')) {
      return next.handle();
    }

    const start = process.hrtime.bigint();

    return next.handle().pipe(
      tap({
        next: () => this.record(context, start),
        error: () => this.record(context, start),
      }),
    );
  }

  private record(context: ExecutionContext, start: bigint) {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const duration = Number(process.hrtime.bigint() - start) / 1e9;
    const route = req.route?.path || req.url || 'unknown';

    this.metricsService.httpRequestDuration.observe(
      {
        method: req.method,
        route,
        status_code: String(res.statusCode || 200),
      },
      duration,
    );
  }
}
