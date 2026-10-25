import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { redisConnection } from '@recipes/config';
import { LLM_QUEUE } from '@recipes/contracts';
import { MessagingModule } from '@recipes/messaging';

import { config } from './config.js';
import { LlmClient } from './llm.client.js';
import { LlmProcessor } from './llm.processor.js';

@Module({
  imports: [
    BullModule.forRoot({ connection: redisConnection(config.redisUrl) }),
    BullModule.registerQueue({ name: LLM_QUEUE }),
    // Publishes the results as events
    MessagingModule.forRoot({ servers: config.natsUrl, service: 'job-runner' }),
  ],
  providers: [LlmClient, LlmProcessor],
})
export class AppModule {}
