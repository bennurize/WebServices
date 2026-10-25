import { Injectable } from '@nestjs/common';

import { config } from './config.js';

interface ChatCompletion {
  choices?: { message?: { content?: string } }[];
}

/** Calls any OpenAI compatible API: /v1/chat/completions */
@Injectable()
export class LlmClient {
  async generate(system: string, prompt: string): Promise<string> {
    const { apiKey, baseUrl, model } = config.llm;
    const response = await fetch(`${baseUrl}/chat/completions`, {
      body: JSON.stringify({
        messages: [
          { content: system, role: 'system' },
          { content: prompt, role: 'user' },
        ],
        model,
      }),
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      method: 'POST',
    });
    if (!response.ok) throw new Error(`LLM answered ${response.status}`);

    const completion = (await response.json()) as ChatCompletion;
    const text = completion.choices?.[0]?.message?.content;
    if (!text) throw new Error('Empty answer from the LLM');

    return text;
  }
}
