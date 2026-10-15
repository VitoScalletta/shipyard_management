import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(excepiton: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: any = {
      message: 'Sunucu tarafından beklenmeyen bir hata oluştu',
    };

    if (excepiton instanceof HttpException) {
      status = excepiton.getStatus();
      errorResponse = excepiton.getResponse();
    } else if (excepiton instanceof QueryFailedError) {
      const dbError = excepiton as any;

      if (dbError.code === '23505') {
        status = HttpStatus.CONFLICT;
        errorResponse = {
          message: 'veritabanı çakışması: bu kayıt zaten sistemde mevcut',
        };
      } else {
        status = HttpStatus.BAD_REQUEST;
        errorResponse = {
          message: 'Veritabanı işlemi başarısız',
          details: dbError.detail,
        };
      }
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      timeStamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      errorDetails: errorResponse,
    });
  }
}
