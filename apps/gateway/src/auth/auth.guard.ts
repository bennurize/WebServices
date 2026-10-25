import type { User } from '@recipes/contracts';
import type { Request } from 'express';

import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { jwtVerify } from 'jose';

import { config } from '../config.js';
import { IS_PUBLIC } from './public.decorator.js';

export interface AuthenticatedRequest extends Request {
  user: User;
}

interface Claims {
  email: string;
  name: string;
  sub: string;
}

/**
 * Stateless: the signature and the expiry are checked with the shared secret,
 * the user service is never called.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  private readonly secret = new TextEncoder().encode(config.jwtSecret);

  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = /^Bearer (.+)$/.exec(
      request.headers.authorization ?? '',
    )?.[1];
    if (!token) throw new UnauthorizedException('Missing bearer token');

    try {
      const { payload } = await jwtVerify<Claims>(token, this.secret);
      request.user = {
        email: payload.email,
        id: payload.sub,
        name: payload.name,
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }
}
