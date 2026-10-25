import type { Job } from 'bullmq';

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { LLM_QUEUE, type LlmJobData, Subjects } from '@recipes/contracts';
import { MessagingService } from '@recipes/messaging';

import { LlmClient } from './llm.client.js';

@Processor(LLM_QUEUE)
export class LlmProcessor extends WorkerHost {
  private readonly logger = new Logger(LlmProcessor.name);

  constructor(
    private readonly llm: LlmClient,
    private readonly messaging: MessagingService,
  ) {
    super();
  }

  /** Throwing makes BullMQ retry the job, with the backoff set by the producer */
  async process({ attemptsMade, data, opts }: Job<LlmJobData>): Promise<void> {
    const { prompt, recipeId, system } = data;
    try {
      const text = await this.llm.generate(system, prompt);
      await this.messaging.publish(Subjects.TextGenerated, { recipeId, text });
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      const isLastAttempt = attemptsMade + 1 >= (opts.attempts ?? 1);
      this.logger.warn(
        `Recipe ${recipeId}: attempt ${attemptsMade + 1} failed (${reason})`,
      );
      if (isLastAttempt) {
        await this.messaging.publish(Subjects.TextFailed, { reason, recipeId });
      }
      throw error;
    }
  }
}
