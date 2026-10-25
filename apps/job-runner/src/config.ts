import { env, loadEnvFile } from '@recipes/config';

loadEnvFile();

export const config = {
  llm: {
    apiKey: env('LLM_API_KEY', 'fake'),
    // Any OpenAI compatible API: the fake provider by default, or a real one
    baseUrl: env('LLM_BASE_URL', 'http://localhost:4010/v1'),
    model: env('LLM_MODEL', 'fake-chef'),
  },
  natsUrl: env('NATS_URL', 'nats://localhost:4222'),
  redisUrl: env('REDIS_URL', 'redis://localhost:6379'),
};
