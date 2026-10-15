import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const requestId = request.id || request.headers['x-request-id'];

    if (status >= 500) {
      this.logger.error(
        {
          requestId,
          method: request.method,
          url: request.url,
          statusCode: status,
          error: exception instanceof Error ? exception.message : exception,
        },
        exception instanceof Error ? exception.stack : 'Unhandled Exception',
      );
    } else {
      this.logger.warn({
        requestId,
        method: request.method,
        url: request.url,
        statusCode: status,
        message,
      });
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      requestId,
      path: request.url,
      message:
        typeof message === 'object' && message !== null && 'message' in message
          ? (message as any).message
          : message,
      timeStamp: new Date().toISOString(),
    });
  }
}