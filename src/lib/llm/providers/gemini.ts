/**
 * Provider Gemini 2.5 Flash via @google/generative-ai.
 *
 * Suporta streaming de chunks de texto. O cliente lazy-importa o SDK
 * dentro de `streamChat` para não custar bundle se a chave não estiver
 * configurada (e para não quebrar o build se a dep ainda não for
 * instalada — falha apenas em runtime no fallback).
 */
import type { ChatMessage, LLMProvider } from '../types';

export const geminiProvider: LLMProvider = {
  id: 'gemini',
  model: 'gemini-2.5-flash',
  envKey: 'GEMINI_API_KEY',

  isAvailable() {
    return Boolean(process.env.GEMINI_API_KEY);
  },

  async *streamChat(opts: { system: string; history: ChatMessage[]; userMessage: string }) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('[gemini] GEMINI_API_KEY ausente');

    const mod = await import('@google/generative-ai');
    const client = new mod.GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: opts.system,
    });

    // Converte histórico para o formato do Gemini.
    const history = opts.history.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({ history });
    const result = await chat.sendMessageStream(opts.userMessage);

    for await (const chunk of result.stream) {
      const text = chunk.text?.();
      if (text) yield text;
    }
  },
};
