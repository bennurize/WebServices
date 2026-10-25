import { NestFactory } from '@nestjs/core';
import { grpcOptions } from '@recipes/contracts/grpc';

import { AppModule } from './app.module.js';
import { config } from './config.js';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(
    AppModule,
    grpcOptions('user', config.grpcUrl),
  );
  app.enableShutdownHooks();
  await app.listen();
}
await bootstrap();
