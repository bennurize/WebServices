import type { JobsOptions } from 'bullmq';

// Work to do goes through BullMQ: each job is processed once, by one job runner.
// The result comes back as an event (text.generated / text.failed).

export const LLM_QUEUE = 'llm';
export const LLM_JOB = 'generate';

export interface LlmJobData {
  prompt: string;
  recipeId: string;
  system: string;
}

export const LLM_JOB_OPTIONS: JobsOptions = {
  // 3 attempts, 1 s then 2 s between them
  attempts: 3,
  backoff: { delay: 1000, type: 'exponential' },
  removeOnComplete: { age: 3600 },
  removeOnFail: { age: 24 * 3600 },
};
