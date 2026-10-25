import { argon2, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const argon2Async = promisify(argon2);

// OWASP minimum recommendation for argon2id
const PARAMS = { memory: 19_456, passes: 2, parallelism: 1 };

/** Stored in the PHC format: $argon2id$v=19$m=...,t=...,p=...$salt$hash */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await argon2Async('argon2id', {
    message: password,
    nonce: salt,
    tagLength: 32,
    ...PARAMS,
  });
  const params = `m=${PARAMS.memory},t=${PARAMS.passes},p=${PARAMS.parallelism}`;

  return `$argon2id$v=19$${params}$${salt.toString('base64')}$${hash.toString('base64')}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  // $argon2id$v=19$m=19456,t=2,p=1$salt$hash
  const [params, salt, hash] = stored.split('$').slice(3);
  const settings = new URLSearchParams(params.replaceAll(',', '&'));
  const expected = Buffer.from(hash, 'base64');
  const actual = await argon2Async('argon2id', {
    memory: Number(settings.get('m')),
    message: password,
    nonce: Buffer.from(salt, 'base64'),
    parallelism: Number(settings.get('p')),
    passes: Number(settings.get('t')),
    tagLength: expected.length,
  });

  return timingSafeEqual(actual, expected);
}
