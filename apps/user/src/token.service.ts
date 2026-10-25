import type { User } from '@recipes/contracts';

import { Injectable } from '@nestjs/common';
import { SignJWT } from 'jose';

import { config } from './config.js';

/**
 * JWT signed with HS256: the same secret signs (here) and verifies (in the
 * gateway). The gateway then trusts the claims without calling this service.
 */
@Injectable()
export class TokenService {
  private readonly secret = new TextEncoder().encode(config.jwtSecret);

  sign(user: User): Promise<string> {
    return new SignJWT({ email: user.email, name: user.name })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(user.id)
      .setIssuedAt()
      .setExpirationTime(config.tokenTtl)
      .sign(this.secret);
  }
}
