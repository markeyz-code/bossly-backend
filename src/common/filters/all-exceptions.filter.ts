import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request & { requestId?: string }>();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Something went wrong on our side. Please try again.';
    let code = 'INTERNAL_ERROR';
    let details: unknown;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
      } else if (body && typeof body === 'object') {
        const b = body as Record<string, unknown>;
        message = Array.isArray(b.message)
          ? (b.message as string[]).join(', ')
          : ((b.message as string) || message);
        details = b.details;
        code = (b.code as string) || `HTTP_${status}`;
      }
    } else if (typeof exception === 'object' && exception !== null && (exception as { code?: number }).code === 11000) {
      status = HttpStatus.CONFLICT;
      message = 'That record already exists.';
      code = 'DUPLICATE';
    }

    if (status === 429) {
      code = 'RATE_LIMITED';
      message = 'Too many attempts. Please wait a minute and try again.';
    }

    if (status >= 500) {
      // Log the stack only. Never log request bodies (they may contain PII or secrets).
      this.logger.error(
        `${req.method} ${req.originalUrl} → ${status} [${req.requestId || '-'}]`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    res.status(status).json({
      success: false,
      error: { code, message, ...(details ? { details } : {}) },
      requestId: req.requestId,
    });
  }
}
