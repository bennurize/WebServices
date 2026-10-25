import { status } from '@grpc/grpc-js';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import {
  type GetUsersRequest,
  type GetUsersResponse,
  type LoginRequest,
  type LoginResponse,
  type RegisterRequest,
  type User as UserDto,
} from '@recipes/contracts';
import { rpcError } from '@recipes/contracts/grpc';
import { type HydratedDocument, isValidObjectId, type Model } from 'mongoose';

import { hashPassword, verifyPassword } from './password.js';
import { TokenService } from './token.service.js';
import { User } from './user.schema.js';

/** Duplicate key error: the email already exists (unique index) */
const DUPLICATE_KEY = 11_000;

@Controller()
export class UserController {
  constructor(
    @InjectModel(User.name) private readonly users: Model<User>,
    private readonly tokens: TokenService,
  ) {}

  @GrpcMethod('UserService', 'GetUsers')
  async getUsers({ ids }: GetUsersRequest): Promise<GetUsersResponse> {
    const users = await this.users.find({
      _id: { $in: ids.filter((id) => isValidObjectId(id)) },
    });

    return { users: users.map((user) => toDto(user)) };
  }

  @GrpcMethod('UserService', 'Login')
  async login({ email, password }: LoginRequest): Promise<LoginResponse> {
    const user = await this.users.findOne({ email: email.toLowerCase() });
    // Same answer for an unknown email and a wrong password: no hint for an attacker
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw rpcError(status.UNAUTHENTICATED, 'Invalid credentials');
    }
    const dto = toDto(user);

    return { token: await this.tokens.sign(dto), user: dto };
  }

  @GrpcMethod('UserService', 'Register')
  async register({ email, name, password }: RegisterRequest): Promise<UserDto> {
    try {
      const user = await this.users.create({
        email,
        name,
        passwordHash: await hashPassword(password),
      });

      return toDto(user);
    } catch (error) {
      if ((error as { code?: number }).code === DUPLICATE_KEY) {
        throw rpcError(status.ALREADY_EXISTS, 'Email already registered');
      }
      throw error;
    }
  }
}

function toDto(user: HydratedDocument<User>): UserDto {
  return { email: user.email, id: user.id, name: user.name };
}
