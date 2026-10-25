// The front only knows the gateway: it never talks to a service directly
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Recipe {
  id: string;
  ownerId: string;
  title: string;
  ingredients: string[];
  steps: string[];
  description: string;
  status: 'done' | 'failed' | 'pending';
  createdAt: string;
  author: null | { id: string; name: string };
}

export interface Session {
  token: string;
  user: User;
}

export interface RecipeInput {
  title: string;
  ingredients: string[];
  steps: string[];
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  method: string,
  path: string,
  token?: string,
  body?: unknown,
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    method,
  });
  if (response.status === 204) return undefined as T;

  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      response.status,
      errorMessage(data) ?? response.statusText,
    );
  }

  return data as T;
}

/** NestJS errors look like { statusCode, message }, message being a text or a list */
function errorMessage(data: unknown): string | undefined {
  if (typeof data !== 'object' || data === null || !('message' in data)) {
    return undefined;
  }
  const { message } = data;
  if (Array.isArray(message)) return message.join(', ');

  return typeof message === 'string' ? message : undefined;
}

export function messageOf(failure: unknown): string {
  return failure instanceof Error ? failure.message : 'Erreur inattendue';
}

export const api = {
  createRecipe: (token: string, input: RecipeInput) =>
    request<Recipe>('POST', '/recipes', token, input),
  deleteRecipe: (token: string, id: string) =>
    request<undefined>('DELETE', `/recipes/${id}`, token),
  listRecipes: (token: string) => request<Recipe[]>('GET', '/recipes', token),
  login: (email: string, password: string) =>
    request<Session>('POST', '/auth/login', undefined, { email, password }),
  register: (email: string, name: string, password: string) =>
    request<User>('POST', '/auth/register', undefined, {
      email,
      name,
      password,
    }),
};
