/**
 * Provider Cerebras (Llama 3.1 70B) via @cerebras/cerebras_cloud_sdk.
 * SDK com API similar a OpenAI: chat.completions.create({ stream }).
 */
import type { ChatMessage, LLMProvider } from '../types';

export const cerebrasProvider: LLMProvider = {
  id: 'cerebras',
  model: 'llama3.1-70b',
  envKey: 'CEREBRAS_API_KEY',

  isAvailable() {
    return Boolean(process.env.CEREBRAS_API_KEY);
  },

  async *streamChat(opts: { system: string; history: ChatMessage[]; userMessage: string }) {
    const apiKey = process.env.CEREBRAS_API_KEY;
    if (!apiKey) throw new Error('[cerebras] CEREBRAS_API_KEY ausente');

    const mod = await import('@cerebras/cerebras_cloud_sdk');
    const Ctor =
      (mod as unknown as { default?: new (cfg: { apiKey: string }) => unknown }).default ??
      (mod as unknown as { Cerebras?: new (cfg: { apiKey: string }) => unknown }).Cerebras;
    if (!Ctor) throw new Error('[cerebras] SDK export não encontrado');

    const client = new Ctor({ apiKey }) as {
      chat: {
        completions: {
          create: (args: unknown) => Promise<AsyncIterable<{ choices: Array<{ delta?: { content?: string } }> }>>;
        };
      };
    };

    const messages = [
      { role: 'system' as const, content: opts.system },
      ...opts.history.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content: opts.userMessage },
    ];

    const stream = await client.chat.completions.create({
      model: 'llama3.1-70b',
      messages,
      stream: true,
      temperature: 0.4,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta?.content;
      if (delta) yield delta;
    }
  },
};
