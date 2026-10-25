import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';

// No HTTP nor gRPC: this service only talks through events
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  app.enableShutdownHooks();
}
await bootstrap();
