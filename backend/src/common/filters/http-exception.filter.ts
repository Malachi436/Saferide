import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  message: string | string[];
  error?: string;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpException');

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const message =
      typeof exceptionResponse === 'object' && 'message' in exceptionResponse
        ? (exceptionResponse as any).message
        : exception.message;

    const errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message || 'Internal server error',
    };

    // Log the error
    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} - Error: ${JSON.stringify(errorResponse)}`,
        exception.stack,
      );
    } else {
      this.logger.warn(
        `[${request.method}] ${request.url} - ${status}: ${JSON.stringify(errorResponse)}`,
      );
    }

    response.status(status).json(errorResponse);
  }
}
