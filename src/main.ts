import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { DomainExceptionFilter } from './common/filters/domain-exception.filter';
import { HttpAdapterHost } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.setGlobalPrefix('api/v1');
  const adapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new DomainExceptionFilter(adapterHost));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
