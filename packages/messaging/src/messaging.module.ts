import { type DynamicModule, Global, Module } from '@nestjs/common';

import {
  MESSAGING_OPTIONS,
  type MessagingOptions,
  MessagingService,
} from './messaging.service.js';

@Global()
@Module({})
export class MessagingModule {
  static forRoot(options: MessagingOptions): DynamicModule {
    return {
      module: MessagingModule,
      providers: [
        { provide: MESSAGING_OPTIONS, useValue: options },
        MessagingService,
      ],
      exports: [MessagingService],
    };
  }
}
