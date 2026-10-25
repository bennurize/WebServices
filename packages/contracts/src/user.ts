import type { Observable } from 'rxjs';

// TypeScript mirror of proto/user.proto (fields in camelCase, see the loader options)

export interface User {
  email: string;
  id: string;
  name: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface GetUsersRequest {
  ids: string[];
}

export interface GetUsersResponse {
  users: User[];
}

export interface UserServiceClient {
  getUsers(request: GetUsersRequest): Observable<GetUsersResponse>;
  login(request: LoginRequest): Observable<LoginResponse>;
  register(request: RegisterRequest): Observable<User>;
}
