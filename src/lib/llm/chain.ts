/**
 * Orquestrador da chain de provedores LLM.
 *
 * Ordem: Gemini → Groq → Cerebras → Mistral.
 * Em caso de erro/indisponibilidade, tenta o próximo.
 *
 * Circuit breaker: provedor que errou nas últimas 3 requisições dentro de
 * 5 minutos é pulado. Estado em memória — adequado para Vercel/Edge dado
 * que processo pode ser efêmero (best-effort).
 */
import { cerebrasProvider } from './providers/cerebras';
import { geminiProvider } from './providers/gemini';
import { groqProvider } from './providers/groq';
import { mistralProvider } from './providers/mistral';
import {
  NoProviderAvailableError,
  type ChatMessage,
  type LLMProvider,
  type LLMStreamOptions,
} from './types';

export const PROVIDERS: LLMProvider[] = [
  geminiProvider,
  groqProvider,
  cerebrasProvider,
  mistralProvider,
];

interface BreakerState {
  failures: number[]; // timestamps de falhas recentes
}

const BREAKER_WINDOW_MS = 5 * 60 * 1000;
const BREAKER_THRESHOLD = 3;

const breaker = new Map<string, BreakerState>();

function isOpen(providerId: string): boolean {
  const state = breaker.get(providerId);
  if (!state) return false;
  const cutoff = Date.now() - BREAKER_WINDOW_MS;
  state.failures = state.failures.filter((ts) => ts >= cutoff);
  return state.failures.length >= BREAKER_THRESHOLD;
}

function recordFailure(providerId: string): void {
  const state = breaker.get(providerId) ?? { failures: [] };
  state.failures.push(Date.now());
  // Mantém só janelas recentes para não vazar memória.
  const cutoff = Date.now() - BREAKER_WINDOW_MS;
  state.failures = state.failures.filter((ts) => ts >= cutoff);
  breaker.set(providerId, state);
}

function recordSuccess(providerId: string): void {
  // Reset rápido após sucesso.
  breaker.delete(providerId);
}

export interface ChainStreamResult {
  provider: LLMProvider['id'];
  stream: AsyncIterable<string>;
}

/**
 * Tenta criar um stream com a chain de providers. Retorna o ID do provider
 * que aceitou + o stream. Erros do stream em curso NÃO disparam fallback —
 * só falhas no momento de iniciar.
 *
 * Para fallback robusto durante stream, usaríamos um wrapper que coleta
 * primeiro chunk antes de emitir, mas isso anula o ganho de streaming.
 * Comportamento atual: melhor esforço, fallback só na inicialização.
 */
export async function streamChat(opts: LLMStreamOptions): Promise<ChainStreamResult> {
  const errors: Array<{ provider: string; error: unknown }> = [];

  for (const provider of PROVIDERS) {
    if (!provider.isAvailable()) continue;
    if (isOpen(provider.id)) continue;

    try {
      // Cria iterator e força a primeira interação para detectar falhas
      // sincronamente (auth, rede). Se falhar, vai para o próximo.
      const inner = provider.streamChat(opts);
      const iterator = inner[Symbol.asyncIterator]();

      let first: IteratorResult<string>;
      try {
        first = await iterator.next();
      } catch (err) {
        recordFailure(provider.id);
        errors.push({ provider: provider.id, error: err });
        continue;
      }

      // Provider aceitou; envolve para emitir o primeiro chunk + restante.
      const stream = (async function* () {
        try {
          if (!first.done) yield first.value;
          while (true) {
            const next = await iterator.next();
            if (next.done) break;
            yield next.value;
          }
          recordSuccess(provider.id);
        } catch (err) {
          recordFailure(provider.id);
          throw err;
        }
      })();

      return { provider: provider.id, stream };
    } catch (err) {
      recordFailure(provider.id);
      errors.push({ provider: provider.id, error: err });
    }
  }

  const summary = errors
    .map((e) => `${e.provider}: ${(e.error as Error)?.message ?? e.error}`)
    .join('; ');
  throw new NoProviderAvailableError(
    summary ? `Nenhum provedor LLM disponível. Detalhes: ${summary}` : 'Nenhum provedor LLM disponível.',
  );
}

export type { ChatMessage, LLMProvider, LLMStreamOptions };
