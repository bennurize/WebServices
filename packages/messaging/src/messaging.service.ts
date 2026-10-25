import type { MessageMap, Subject } from '@recipes/contracts';

import {
  AckPolicy,
  type ConsumerMessages,
  DeliverPolicy,
  jetstream,
  type JetStreamClient,
  type JetStreamManager,
  jetstreamManager,
} from '@nats-io/jetstream';
import { connect, type NatsConnection } from '@nats-io/transport-node';
import {
  Inject,
  Injectable,
  Logger,
  type OnApplicationShutdown,
  type OnModuleInit,
} from '@nestjs/common';

import { EVENTS_STREAM } from './streams.js';

export const MESSAGING_OPTIONS = Symbol('MESSAGING_OPTIONS');

export interface MessagingOptions {
  servers: string;
  /** Service name: prefix of the durable consumers, shared by all its instances */
  service: string;
}

export type Handler<S extends Subject> = (data: MessageMap[S]) => Promise<void>;

/** A failed message comes back after this delay */
const REDELIVERY_DELAY_MS = 5000;

@Injectable()
export class MessagingService implements OnApplicationShutdown, OnModuleInit {
  private readonly logger = new Logger(MessagingService.name);
  // Set in onModuleInit, which Nest runs before anything else uses this service
  private connection!: NatsConnection;
  private js!: JetStreamClient;
  private jsm!: JetStreamManager;

  constructor(
    @Inject(MESSAGING_OPTIONS) private readonly options: MessagingOptions,
  ) {}

  async onApplicationShutdown() {
    await this.connection.drain();
  }

  async onModuleInit() {
    this.connection = await connect({
      name: this.options.service,
      servers: this.options.servers,
      waitOnFirstConnect: true,
    });
    this.jsm = await jetstreamManager(this.connection);
    this.js = jetstream(this.connection);
    await this.jsm.streams
      .add(EVENTS_STREAM)
      .catch(() => this.jsm.streams.update(EVENTS_STREAM.name, EVENTS_STREAM));
  }

  /** Stored in the stream until every consumer has acknowledged it */
  async publish<S extends Subject>(
    subject: S,
    data: MessageMap[S],
  ): Promise<void> {
    await this.js.publish(subject, JSON.stringify(data));
  }

  /**
   * Durable consumer shared by every instance of the service: each message is
   * handled by one instance only, and survives a restart of the service.
   */
  async consume<S extends Subject>(
    subject: S,
    handler: Handler<S>,
  ): Promise<void> {
    const durable = `${this.options.service}-${subject.replaceAll('.', '-')}`;
    const config = {
      ack_policy: AckPolicy.Explicit,
      deliver_policy: DeliverPolicy.All,
      durable_name: durable,
      filter_subject: subject,
    };
    await this.jsm.consumers
      .add(EVENTS_STREAM.name, config)
      .catch(() =>
        this.jsm.consumers.update(EVENTS_STREAM.name, durable, config),
      );

    const consumer = await this.js.consumers.get(EVENTS_STREAM.name, durable);
    // One message at a time: a buffered message could see its ack delay run out
    const messages = await consumer.consume({ max_messages: 1 });
    void this.loop(messages, subject, handler);
    this.logger.log(`Consuming ${subject} as ${durable}`);
  }

  private async loop<S extends Subject>(
    messages: ConsumerMessages,
    subject: S,
    handler: Handler<S>,
  ) {
    for await (const message of messages) {
      try {
        await handler(message.json<MessageMap[S]>());
        message.ack();
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        this.logger.warn(`${subject}: ${reason}, redelivered later`);
        message.nak(REDELIVERY_DELAY_MS);
      }
    }
  }
}
