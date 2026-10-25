import { Metadata, status } from '@grpc/grpc-js';
import {
  type GrpcOptions,
  RpcException,
  Transport,
} from '@nestjs/microservices';
import { fileURLToPath } from 'node:url';

export type GrpcPackage = 'recipe' | 'user';

/** The .proto files ship with this package, next to its dist/ folder */
const PROTO_DIR = fileURLToPath(new URL('../proto/', import.meta.url));

/** Same options for the server (bind address) and the clients (target address). */
export function grpcOptions(pkg: GrpcPackage, url: string): GrpcOptions {
  return {
    transport: Transport.GRPC,
    options: {
      package: pkg,
      protoPath: `${PROTO_DIR}${pkg}.proto`,
      url,
      loader: {
        keepCase: false,
        longs: String,
        enums: String,
        defaults: true,
        arrays: true,
      },
    },
  };
}

/** The gateway authenticates the user, then passes its id along to the services. */
export const USER_ID_METADATA = 'x-user-id';

export function userMetadata(userId: string): Metadata {
  const metadata = new Metadata();
  metadata.set(USER_ID_METADATA, userId);

  return metadata;
}

export function requireUserId(metadata: Metadata): string {
  const [userId] = metadata.get(USER_ID_METADATA);
  if (!userId) throw rpcError(status.UNAUTHENTICATED, 'Missing user identity');

  return String(userId);
}

export function rpcError(code: status, message: string): RpcException {
  return new RpcException({ code, message });
}
