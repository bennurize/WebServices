import type { Queue } from 'bullmq';

import { InjectQueue } from '@nestjs/bullmq';
import {
  Injectable,
  Logger,
  type OnApplicationBootstrap,
} from '@nestjs/common';
import {
  LLM_JOB,
  LLM_QUEUE,
  type LlmJobData,
  type RecipeCreated,
  Subjects,
  type TextFailed,
  type TextGenerated,
} from '@recipes/contracts';
import { MessagingService } from '@recipes/messaging';

import { buildPrompt } from './prompts.js';

/** Turns a new recipe into an LLM job, then the job result into an enrichment */
@Injectable()
export class EnricherService implements OnApplicationBootstrap {
  private readonly logger = new Logger(EnricherService.name);

  constructor(
    @InjectQueue(LLM_QUEUE) private readonly llmQueue: Queue<LlmJobData>,
    private readonly messaging: MessagingService,
  ) {}

  async onApplicationBootstrap() {
    await this.messaging.consume(Subjects.RecipeCreated, (event) =>
      this.onRecipeCreated(event),
    );
    await this.messaging.consume(Subjects.TextGenerated, (event) =>
      this.onTextGenerated(event),
    );
    await this.messaging.consume(Subjects.TextFailed, (event) =>
      this.onTextFailed(event),
    );
  }

  private async onRecipeCreated(recipe: RecipeCreated) {
    await this.llmQueue.add(LLM_JOB, {
      recipeId: recipe.recipeId,
      ...buildPrompt(recipe),
    });
  }

  private async onTextFailed({ reason, recipeId }: TextFailed) {
    this.logger.warn(`Recipe ${recipeId}: enrichment failed (${reason})`);
    await this.messaging.publish(Subjects.RecipeEnriched, {
      recipeId,
      status: 'failed',
    });
  }

  private async onTextGenerated({ recipeId, text }: TextGenerated) {
    await this.messaging.publish(Subjects.RecipeEnriched, {
      description: text.trim(),
      recipeId,
      status: 'done',
    });
  }
}
