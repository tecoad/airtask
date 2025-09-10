import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { AppModule } from './app.module';
import { ENV } from './config/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // registrar o manipulador de eventos uncaughtException
  process.on('uncaughtException', (err) => {
    Logger.error('Top-level error not handled');
    console.log(err);
  });

  // registrar o manipulador de eventos unhandledRejection
  process.on('unhandledRejection', (reason) => {
    Logger.error('Top-level promise error not handled', reason);
    console.log(reason);
  });

  app.enableCors();

  app.useWebSocketAdapter(new WsAdapter(app));

  await app.listen(ENV.PORT);
}
bootstrap();
