/*
 * Fake LLM provider: same API as OpenAI's /v1/chat/completions, with some
 * latency and a configurable failure rate. No runtime dependency.
 */

import { createHash } from 'node:crypto';
import { createServer, type ServerResponse } from 'node:http';
import { text } from 'node:stream/consumers';
import { setTimeout as sleep } from 'node:timers/promises';

const PORT = Number(process.env.PORT ?? 4010);
/** Share of the requests answered with a 503, between 0 and 1 */
const FAILURE_RATE = Number(process.env.FAKE_FAILURE_RATE ?? 0);

const ADJECTIVES = ['généreuse', 'réconfortante', 'parfumée', 'gourmande'];
const OCCASIONS = [
  'un dîner entre amis',
  'un repas en famille',
  'un déjeuner pressé',
  'une soirée d’hiver',
];

// eslint-disable-next-line sonarjs/pseudo-random -- simulated latency and failures, nothing secret
const roll = (): number => Math.random();

function send(response: ServerResponse, status: number, body: unknown) {
  response.writeHead(status, { 'content-type': 'application/json' });
  response.end(JSON.stringify(body));
}

/** Always the same description for the same recipe */
function describe(prompt: string): string {
  const title = /Recette : (.+)/.exec(prompt)?.[1] ?? 'Cette recette';
  const ingredient = /Ingrédients : ([^,\n]+)/.exec(prompt)?.[1] ?? 'saison';
  const seed = createHash('sha256').update(prompt).digest().readUInt32BE(0);
  const adjective = ADJECTIVES[seed % ADJECTIVES.length];
  const occasion = OCCASIONS[seed % OCCASIONS.length];

  return `${title} : une recette ${adjective} à base de ${ingredient}. Idéale pour ${occasion}.`;
}

async function completion(body: string, response: ServerResponse) {
  const { messages = [] } = JSON.parse(body) as {
    messages?: { content: string }[];
  };
  await sleep(1000 + roll() * 2000);
  if (roll() < FAILURE_RATE) {
    send(response, 503, { error: { message: 'The server is overloaded' } });

    return;
  }
  const prompt = messages.map((message) => message.content).join('\n');
  send(response, 200, {
    choices: [{ message: { content: describe(prompt), role: 'assistant' } }],
  });
}

createServer((request, response) => {
  if (request.method === 'POST' && request.url === '/v1/chat/completions') {
    text(request)
      .then((body) => completion(body, response))
      .catch(() => {
        send(response, 400, { error: { message: 'Invalid JSON body' } });
      });

    return;
  }
  send(response, 404, { error: { message: 'Not found' } });
}).listen(PORT, () => {
  console.log(`Fake LLM API on :${PORT}, failure rate: ${FAILURE_RATE}`);
});
