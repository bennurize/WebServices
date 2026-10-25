import { env, loadEnvFile } from '@recipes/config';

loadEnvFile();

export const config = {
  /** Shared with the user service, which signs the tokens (see `pnpm secret`) */
  jwtSecret: env('JWT_SECRET'),
  port: Number(env('GATEWAY_PORT', '3000')),
  recipeGrpcUrl: env('RECIPE_GRPC_URL', 'localhost:50052'),
  userGrpcUrl: env('USER_GRPC_URL', 'localhost:50051'),
};
