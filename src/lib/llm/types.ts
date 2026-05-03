/**
 * Tipos compartilhados pela camada LLM.
 */

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
  ts?: string;
}

export interface LLMStreamOptions {
  system: string;
  history: ChatMessage[];
  userMessage: string;
}

export interface LLMProvider {
  id: 'gemini' | 'groq' | 'cerebras' | 'mistral';
  model: string;
  envKey: string;
  isAvailable(): boolean;
  streamChat(opts: LLMStreamOptions): AsyncIterable<string>;
}

export class RateLimitError extends Error {
  constructor(public scope: 'daily_user' | 'daily_global', message?: string) {
    super(message ?? `Rate limit reached: ${scope}`);
    this.name = 'RateLimitError';
  }
}

export class NoProviderAvailableError extends Error {
  constructor(message?: string) {
    super(message ?? 'Nenhum provedor LLM disponível');
    this.name = 'NoProviderAvailableError';
  }
}
