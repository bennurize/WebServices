import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';

// No HTTP nor gRPC: this service only consumes commands
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  app.enableShutdownHooks();
}
await bootstrap();
