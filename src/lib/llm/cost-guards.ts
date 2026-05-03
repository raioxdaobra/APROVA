/**
 * Cost guardrails para uso do chat IA.
 *
 * Limites:
 * - 100 mensagens/dia/usuário
 * - 5000 mensagens/dia globais
 *
 * Tabelas (gerenciadas por Worktree A):
 * - daily_chat_usage(user_id, day, msg_count)
 * - global_chat_usage(day, msg_count, by_provider)
 *
 * Como Worktree A ainda não publicou os tipos correspondentes, acessamos
 * essas tabelas via cast `as never as ...`. Na merge final esses casts
 * podem ser removidos.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { RateLimitError } from './types';

export const USER_DAILY_LIMIT = 100;
export const GLOBAL_DAILY_LIMIT = 5000;

function todayUtcDate(): string {
  // YYYY-MM-DD em UTC (suficiente; o spec menciona Fortaleza só para missions).
  return new Date().toISOString().slice(0, 10);
}

// Helper para destravar tipagem em tabelas que ainda não estão no Database
// (Worktree A é dona dos types). Usamos `unknown`-cast através de SupabaseClient
// genérico sem parâmetros. Após Worktree A publicar os tipos, remover.
type AnyDb = SupabaseClient;

export async function getUserDailyMsgs(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const day = todayUtcDate();
  const { data, error } = await (supabase as AnyDb)
    .from('daily_chat_usage')
    .select('msg_count')
    .eq('user_id', userId)
    .eq('day', day)
    .maybeSingle();
  if (error) {
    // Em caso de erro de leitura (ex.: tabela ainda não existe localmente),
    // não bloqueia a UX — assume 0.
    return 0;
  }
  return Number((data as { msg_count?: number } | null)?.msg_count ?? 0);
}

export async function getGlobalDailyMsgs(supabase: SupabaseClient): Promise<number> {
  const day = todayUtcDate();
  const { data, error } = await (supabase as AnyDb)
    .from('global_chat_usage')
    .select('msg_count')
    .eq('day', day)
    .maybeSingle();
  if (error) return 0;
  return Number((data as { msg_count?: number } | null)?.msg_count ?? 0);
}

export async function checkUserCap(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  const count = await getUserDailyMsgs(supabase, userId);
  if (count >= USER_DAILY_LIMIT) {
    throw new RateLimitError(
      'daily_user',
      `Você atingiu o limite diário de ${USER_DAILY_LIMIT} mensagens no chat. Tente novamente amanhã.`,
    );
  }
}

export async function checkGlobalCap(supabase: SupabaseClient): Promise<void> {
  const count = await getGlobalDailyMsgs(supabase);
  if (count >= GLOBAL_DAILY_LIMIT) {
    throw new RateLimitError(
      'daily_global',
      'Limite diário global do chat atingido. Tente novamente em algumas horas.',
    );
  }
}

/**
 * Incrementa contadores diários por usuário e global, atribuindo o uso ao
 * provider que respondeu. Faz best-effort upsert+increment via dois passos
 * (RPC seria preferível, mas preferimos zero-deps no DB neste worktree).
 */
export async function incrementUsage(
  supabase: SupabaseClient,
  userId: string,
  provider: string,
): Promise<void> {
  const day = todayUtcDate();

  // user
  {
    const { data: existing } = await (supabase as AnyDb)
      .from('daily_chat_usage')
      .select('msg_count')
      .eq('user_id', userId)
      .eq('day', day)
      .maybeSingle();
    const current = Number((existing as { msg_count?: number } | null)?.msg_count ?? 0);
    await (supabase as AnyDb)
      .from('daily_chat_usage')
      .upsert(
        { user_id: userId, day, msg_count: current + 1 },
        { onConflict: 'user_id,day' },
      );
  }

  // global
  {
    const { data: existing } = await (supabase as AnyDb)
      .from('global_chat_usage')
      .select('msg_count, by_provider')
      .eq('day', day)
      .maybeSingle();
    const row = (existing as { msg_count?: number; by_provider?: Record<string, number> } | null) ?? null;
    const currentCount = Number(row?.msg_count ?? 0);
    const byProvider = { ...(row?.by_provider ?? {}) };
    byProvider[provider] = Number(byProvider[provider] ?? 0) + 1;
    await (supabase as AnyDb)
      .from('global_chat_usage')
      .upsert(
        { day, msg_count: currentCount + 1, by_provider: byProvider },
        { onConflict: 'day' },
      );
  }
}
