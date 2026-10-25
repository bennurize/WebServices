// End-to-end check of the platform, through the gateway only: `pnpm smoke`
// (the platform must be running)
import assert from 'node:assert/strict';
import { setTimeout as sleep } from 'node:timers/promises';

const GATEWAY = process.env.GATEWAY_URL ?? 'http://localhost:3000';

interface Recipe {
  author: null | { id: string; name: string };
  description: string;
  id: string;
  status: 'done' | 'failed' | 'pending';
  title: string;
}

interface Session {
  token: string;
  user: { id: string };
}

interface Reply<T> {
  body: T;
  status: number;
}

async function api<T = unknown>(
  method: string,
  path: string,
  token?: string,
  body?: unknown,
): Promise<Reply<T>> {
  const response = await fetch(`${GATEWAY}${path}`, {
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    method,
  });
  const text = await response.text();

  return {
    body: (text ? JSON.parse(text) : undefined) as T,
    status: response.status,
  };
}

async function signUp(name: string) {
  const email = `${name.toLowerCase()}-${Date.now()}@example.com`;
  const registered = await api('POST', '/auth/register', undefined, {
    email,
    name,
    password: 'password123',
  });
  assert.equal(registered.status, 201, JSON.stringify(registered.body));
  const login = await api<Session>('POST', '/auth/login', undefined, {
    email,
    password: 'password123',
  });
  assert.equal(login.status, 200);

  return { email, id: login.body.user.id, token: login.body.token };
}

function recipe(title: string) {
  return {
    ingredients: ['farine', 'oeufs', 'lait'],
    steps: ['Mélanger', 'Cuire'],
    title,
  };
}

/** Polls the recipe until its enrichment is over: the gateway answers before the enricher */
async function waitForEnrichment(
  id: string,
  token: string,
  timeoutMs = 30_000,
): Promise<Recipe> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const { body } = await api<Recipe>('GET', `/recipes/${id}`, token);
    if (body.status !== 'pending') return body;
    await sleep(500);
  }
  throw new Error(`Recipe ${id} still pending after ${timeoutMs} ms`);
}

async function step(title: string, run: () => Promise<void>) {
  const start = Date.now();
  await run();
  console.log(`ok   ${title} (${Date.now() - start} ms)`);
}

const alice = await signUp('Alice');
const bob = await signUp('Bob');
let aliceRecipe: Recipe | undefined;

await step('anonymous and invalid tokens are rejected', async () => {
  const anonymous = await api('GET', '/recipes');
  const invalid = await api('GET', '/recipes', 'not-a-token');
  assert.equal(anonymous.status, 401);
  assert.equal(invalid.status, 401);
});

await step('an email cannot be registered twice', async () => {
  const { status } = await api('POST', '/auth/register', undefined, {
    email: alice.email,
    name: 'Alice',
    password: 'password123',
  });
  assert.equal(status, 409);
});

await step('the gateway validates the input', async () => {
  const { status } = await api('POST', '/recipes', alice.token, {
    title: 'ab',
  });
  assert.equal(status, 400);
});

await step('a recipe is enriched in the background', async () => {
  const created = await api<Recipe>(
    'POST',
    '/recipes',
    alice.token,
    recipe('Crêpes du dimanche'),
  );
  assert.equal(created.status, 201);
  assert.equal(created.body.status, 'pending');
  aliceRecipe = await waitForEnrichment(created.body.id, alice.token);
  assert.equal(aliceRecipe.status, 'done');
  assert.ok(aliceRecipe.description.length > 10);
  assert.equal(aliceRecipe.author?.name, 'Alice');
});

await step('only the owner can delete a recipe', async () => {
  assert.ok(aliceRecipe);
  const { status } = await api(
    'DELETE',
    `/recipes/${aliceRecipe.id}`,
    bob.token,
  );
  assert.equal(status, 403);
});

await step('the owner can delete a recipe', async () => {
  assert.ok(aliceRecipe);
  const deleted = await api(
    'DELETE',
    `/recipes/${aliceRecipe.id}`,
    alice.token,
  );
  const afterwards = await api(
    'GET',
    `/recipes/${aliceRecipe.id}`,
    alice.token,
  );
  assert.equal(deleted.status, 204);
  assert.equal(afterwards.status, 404);
});

await step('/me is read from the token', async () => {
  const { body, status } = await api<{ id: string }>('GET', '/me', alice.token);
  assert.equal(status, 200);
  assert.equal(body.id, alice.id);
});
