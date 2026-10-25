import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';

// Connects to user-db and does nothing else yet: no gRPC server so far
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  app.enableShutdownHooks();
}
await bootstrap();
