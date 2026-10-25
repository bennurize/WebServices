import { env, loadEnvFile } from '@recipes/config';

loadEnvFile();

export const config = {
  natsUrl: env('NATS_URL', 'nats://localhost:4222'),
  redisUrl: env('REDIS_URL', 'redis://localhost:6379'),
};
