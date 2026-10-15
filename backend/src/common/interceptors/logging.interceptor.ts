import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url } = req;

    const requestId = uuidv4();
    const now = Date.now();

    this.logger.log(`[${requestId}] İSTEK GELDİ : ${method} ${url}`);

    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse();
        const delay = Date.now() - now;
        this.logger.log(
          `[${requestId}] YANIT DÖNDÜ : ${method} ${url} - Status ${res.statusCode} - Süre: ${delay}ms`,
        );
      }),
    );
  }
}
