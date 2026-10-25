import { env, loadEnvFile } from '@recipes/config';

loadEnvFile();

export const config = {
  grpcUrl: `0.0.0.0:${env('RECIPE_GRPC_PORT', '50052')}`,
  mongoUrl: env('MONGO_URL', 'mongodb://localhost:27019'),
  natsUrl: env('NATS_URL', 'nats://localhost:4222'),
};
