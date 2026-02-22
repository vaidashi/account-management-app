import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core';

type DomainError = { code: string; message: string };

@Catch()
export class DomainExceptionFilter extends BaseExceptionFilter {
  constructor(adapterHost: HttpAdapterHost) {
    super(adapterHost.httpAdapter);
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const error = exception as DomainError;

    if (error?.code) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      response.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
        error: error.code,
        message: error.message,
      });
      return;
    }

    // Delegate non-domain errors to Nest (prevents crash)
    super.catch(exception, host);
  }
}
