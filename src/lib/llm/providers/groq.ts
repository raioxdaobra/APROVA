/**
 * Provider Groq (Llama 3.3 70B Versatile) via groq-sdk.
 * Streaming via OpenAI-compatible chat.completions.create({ stream: true }).
 */
import type { ChatMessage, LLMProvider } from '../types';

export const groqProvider: LLMProvider = {
  id: 'groq',
  model: 'llama-3.3-70b-versatile',
  envKey: 'GROQ_API_KEY',

  isAvailable() {
    return Boolean(process.env.GROQ_API_KEY);
  },

  async *streamChat(opts: { system: string; history: ChatMessage[]; userMessage: string }) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('[groq] GROQ_API_KEY ausente');

    const mod = await import('groq-sdk');
    const Ctor = (mod as unknown as { default: new (cfg: { apiKey: string }) => unknown }).default;
    const client = new Ctor({ apiKey }) as {
      chat: {
        completions: {
          create: (args: unknown) => Promise<AsyncIterable<{ choices: Array<{ delta?: { content?: string } }> }>>;
        };
      };
    };

    const messages = [
      { role: 'system' as const, content: opts.system },
      ...opts.history.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user' as const, content: opts.userMessage },
    ];

    const stream = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
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
