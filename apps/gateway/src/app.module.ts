import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ClientsModule } from '@nestjs/microservices';
import { grpcOptions } from '@recipes/contracts/grpc';

import { AuthController } from './auth/auth.controller.js';
import { AuthGuard } from './auth/auth.guard.js';
import { ErrorFilter } from './common/error.filter.js';
import { RECIPE_CLIENT, USER_CLIENT } from './common/grpc.js';
import { config } from './config.js';
import { HealthController } from './health.controller.js';
import { RecipesController } from './recipes/recipes.controller.js';

@Module({
  controllers: [AuthController, HealthController, RecipesController],
  imports: [
    ClientsModule.register([
      { name: USER_CLIENT, ...grpcOptions('user', config.userGrpcUrl) },
      { name: RECIPE_CLIENT, ...grpcOptions('recipe', config.recipeGrpcUrl) },
    ]),
  ],
  providers: [
    // Every route needs a valid token, unless marked @Public()
    { provide: APP_GUARD, useClass: AuthGuard },
    // gRPC errors of the services -> HTTP status codes
    { provide: APP_FILTER, useClass: ErrorFilter },
    // Rejects unknown fields and wrong types before anything reaches a service
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        forbidNonWhitelisted: true,
        transform: true,
        whitelist: true,
      }),
    },
  ],
})
export class AppModule {}
