export interface RedisConnection {
  host: string;
  password?: string;
  port: number;
}

/** redis://:password@host:port -> connection options, as BullMQ expects them */
export function redisConnection(url: string): RedisConnection {
  const { hostname, password, port } = new URL(url);

  return {
    host: hostname,
    port: Number(port || 6379),
    ...(password ? { password: decodeURIComponent(password) } : {}),
  };
}
