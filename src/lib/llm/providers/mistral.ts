/**
 * Provider Mistral (Mistral Large) via @mistralai/mistralai.
 * Streaming via client.chat.stream().
 */
import type { ChatMessage, LLMProvider } from '../types';

export const mistralProvider: LLMProvider = {
  id: 'mistral',
  model: 'mistral-large-latest',
  envKey: 'MISTRAL_API_KEY',

  isAvailable() {
    return Boolean(process.env.MISTRAL_API_KEY);
  },

  async *streamChat(opts: { system: string; history: ChatMessage[]; userMessage: string }) {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) throw new Error('[mistral] MISTRAL_API_KEY ausente');

    const mod = await import('@mistralai/mistralai');
    const Ctor =
      (mod as unknown as { Mistral?: new (cfg: { apiKey: string }) => unknown }).Mistral ??
      (mod as unknown as { default?: new (cfg: { apiKey: string }) => unknown }).default;
    if (!Ctor) throw new Error('[mistral] SDK export não encontrado');

    const client = new Ctor({ apiKey }) as {
      chat: {
        stream: (
          args: unknown,
        ) => Promise<AsyncIterable<{ data?: { choices?: Array<{ delta?: { content?: string } }> } }>>;
      };
    };

    const messages = [
      { role: 'system' as const, content: opts.system },
      ...opts.history.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content: opts.userMessage },
    ];

    const stream = await client.chat.stream({
      model: 'mistral-large-latest',
      messages,
      temperature: 0.4,
    });

    for await (const event of stream) {
      const delta = event?.data?.choices?.[0]?.delta?.content;
      if (typeof delta === 'string' && delta) yield delta;
    }
  },
};
