import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { redisConnection } from '@recipes/config';
import { LLM_JOB_OPTIONS, LLM_QUEUE } from '@recipes/contracts';
import { MessagingModule } from '@recipes/messaging';

import { config } from './config.js';
import { EnricherService } from './enricher.service.js';

@Module({
  imports: [
    MessagingModule.forRoot({ servers: config.natsUrl, service: 'enricher' }),
    // Producer only: the job runner processes the jobs
    BullModule.forRoot({ connection: redisConnection(config.redisUrl) }),
    BullModule.registerQueue({
      defaultJobOptions: LLM_JOB_OPTIONS,
      name: LLM_QUEUE,
    }),
  ],
  providers: [EnricherService],
})
export class AppModule {}
