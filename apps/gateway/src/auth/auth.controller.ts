import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  type OnModuleInit,
  Post,
  Req,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { type UserServiceClient } from '@recipes/contracts';
import { lastValueFrom } from 'rxjs';

import { USER_CLIENT } from '../common/grpc.js';
import { LoginDto, RegisterDto, SessionView, UserView } from './auth.dto.js';
import { type AuthenticatedRequest } from './auth.guard.js';
import { Public } from './public.decorator.js';

@ApiTags('auth')
@Controller()
export class AuthController implements OnModuleInit {
  // Set in onModuleInit, once the gRPC client is connected
  private users!: UserServiceClient;

  constructor(@Inject(USER_CLIENT) private readonly client: ClientGrpc) {}

  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @HttpCode(200)
  @Post('auth/login')
  @Public()
  login(@Body() body: LoginDto): Promise<SessionView> {
    return lastValueFrom(this.users.login(body));
  }

  /** Read from the token itself: no call to the user service */
  @ApiBearerAuth()
  @Get('me')
  me(@Req() request: AuthenticatedRequest): UserView {
    return request.user;
  }

  onModuleInit() {
    this.users = this.client.getService<UserServiceClient>('UserService');
  }

  @ApiConflictResponse({ description: 'Email already registered' })
  @Post('auth/register')
  @Public()
  register(@Body() body: RegisterDto): Promise<UserView> {
    return lastValueFrom(this.users.register(body));
  }
}
