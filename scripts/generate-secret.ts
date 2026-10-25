// Writes a random JWT_SECRET in .env: shared by the user service (signs the
// tokens) and the gateway (verifies them)
import { randomBytes } from 'node:crypto';
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';

if (!existsSync('.env')) copyFileSync('.env.example', '.env');

const env = readFileSync('.env', 'utf8');
const line = `JWT_SECRET=${randomBytes(32).toString('base64url')}`;
const pattern = /^JWT_SECRET=.*$/m;

writeFileSync(
  '.env',
  pattern.test(env)
    ? env.replace(pattern, line)
    : `${env.trimEnd()}\n${line}\n`,
);
console.log('New JWT_SECRET written to .env');
