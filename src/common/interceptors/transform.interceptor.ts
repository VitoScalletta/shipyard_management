import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface StandartResponse<T> {
  succes: boolean;
  data: T;
  timeStamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  StandartResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandartResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        succes: true,
        data: data || null,
        timeStamp: new Date().toISOString(),
      })),
    );
  }
}
