import { RetentionPolicy, type StreamConfig } from '@nats-io/jetstream';
import { Subjects } from '@recipes/contracts';

export const nanos = (milliseconds: number) => milliseconds * 1_000_000;

/** Every event goes to one stream, kept for a week: each consumer reads it at its own pace */
export const EVENTS_STREAM: Pick<
  StreamConfig,
  'max_age' | 'name' | 'retention' | 'subjects'
> = {
  max_age: nanos(7 * 24 * 3600 * 1000),
  name: 'EVENTS',
  retention: RetentionPolicy.Limits,
  subjects: Object.values(Subjects),
};
