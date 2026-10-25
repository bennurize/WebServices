import { env, loadEnvFile } from '@recipes/config';

loadEnvFile();

export const config = {
  grpcUrl: `0.0.0.0:${env('USER_GRPC_PORT', '50051')}`,
  /** Shared with the gateway, which verifies the tokens (see `pnpm secret`) */
  jwtSecret: env('JWT_SECRET'),
  mongoUrl: env('MONGO_URL', 'mongodb://localhost:27018'),
  tokenTtl: env('TOKEN_TTL', '1h'),
};
