import { existsSync } from 'node:fs';
import path from 'node:path';

/**
 * Loads the closest .env, from the working directory up: in the monorepo, the
 * one at the root, whichever app runs. Variables already set (by Docker
 * Compose for instance) take precedence over the file.
 */
export function loadEnvFile(): void {
  let directory = process.cwd();
  for (;;) {
    const file = path.join(directory, '.env');
    if (existsSync(file)) {
      process.loadEnvFile(file);

      return;
    }
    const parent = path.dirname(directory);
    // No .env at all: the environment is enough
    if (parent === directory) return;
    directory = parent;
  }
}

/** An empty variable counts as missing: Compose passes `${VAR:-}` as an empty string */
export function env(name: string, fallback?: string): string {
  const value = process.env[name];
  if (value !== undefined && value !== '') return value;
  if (fallback === undefined) {
    throw new Error(`Missing environment variable ${name}`);
  }

  return fallback;
}
