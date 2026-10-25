import type { Response } from 'express';

import { status } from '@grpc/grpc-js';
import { type ArgumentsHost, Catch, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

/** gRPC status of the services -> HTTP status of the public API */
const HTTP_STATUS: Partial<Record<status, number>> = {
  [status.ALREADY_EXISTS]: 409,
  [status.INVALID_ARGUMENT]: 400,
  [status.NOT_FOUND]: 404,
  [status.PERMISSION_DENIED]: 403,
  [status.UNAUTHENTICATED]: 401,
  [status.UNAVAILABLE]: 503,
};

interface GrpcError {
  code: status;
  details: string;
}

function isGrpcError(error: unknown): error is GrpcError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'number' &&
    'details' in error
  );
}

@Catch()
export class ErrorFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(ErrorFilter.name);

  override catch(error: unknown, host: ArgumentsHost) {
    if (!isGrpcError(error)) {
      // HttpException (validation, guard...) or unexpected error: Nest default handling
      super.catch(error, host);

      return;
    }
    const response = host.switchToHttp().getResponse<Response>();
    const statusCode = HTTP_STATUS[error.code] ?? 500;
    if (statusCode < 500) {
      response.status(statusCode).json({ message: error.details, statusCode });

      return;
    }
    // Internal details (addresses, stack...) stay in the logs, not in the response
    this.logger.error(`gRPC error ${error.code}: ${error.details}`);
    const message =
      statusCode === 500 ? 'Internal error' : 'Service unavailable';
    response.status(statusCode).json({ message, statusCode });
  }
}
