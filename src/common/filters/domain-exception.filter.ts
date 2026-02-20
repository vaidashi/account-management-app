import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';

type DomainError = { code: string; message: string };

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const error = exception as DomainError;

    if (error?.code) {
      response.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
        error: error.code,
        message: error.message,
      });
      return;
    }

    throw exception;
  }
}
