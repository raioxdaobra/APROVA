/**
 * Plan caps — Free tier limits e helpers para verificar/incrementar uso.
 *
 * Free tier (lifetime):
 *   - 30 questões totais (`profiles.questions_used_count`)
 *   - 1 simulado total (`profiles.simulados_used_count`)
 *   - 5 chats IA/dia (delegado para `daily_chat_usage` via cost-guards)
 *
 * Pro tier:
 *   - Tudo ilimitado.
 *   - Considerado ativo quando `profiles.plan = 'pro'` e
 *     `profiles.plan_expires_at` é null ou está no futuro.
 *
 * Trial (PR 28):
 *   - Todo signup recebe `profiles.trial_ends_at = now() + 7d` via trigger.
 *   - Enquanto `now() < trial_ends_at`, o usuário tem acesso ilimitado
 *     equivalente a Pro (plano efetivo `'trial'`). Isto **não** muda
 *     `profiles.plan` (continua `'free'`) — preserva o paywall pós-trial.
 *
 * Estas funções leem/escrevem em `profiles`. RLS garante que o usuário só
 * pode ler/atualizar a própria linha. Para incrementos atômicos preferimos
 * SQL via update aritmético (sem RPC) — não-bloqueante para a UX.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Plan } from '@/lib/supabase/types';

export const FREE_QUESTIONS_LIMIT = 30;
export const FREE_SIMULADOS_LIMIT = 1;
export const FREE_CHAT_DAILY_LIMIT = 5;

export type EffectivePlan = Plan | 'admin' | 'trial';

export interface PlanInfo {
  plan: Plan;
  isPro: boolean;
  isAdmin: boolean;
  isTrial: boolean;
  questionsUsed: number;
  simuladosUsed: number;
  planExpiresAt: string | null;
  trialEndsAt: string | null;
}

export interface CapResult {
  allowed: boolean;
  used: number;
  limit: number;
  plan: EffectivePlan;
}

export interface CapOptions {
  /** Quando true, ignora bypass admin/trial e simula plano free. */
  previewFreeMode?: boolean;
}

function isProActive(plan: Plan, planExpiresAt: string | null): boolean {
  if (plan !== 'pro') return false;
  if (!planExpiresAt) return true;
  const exp = Date.parse(planExpiresAt);
  if (Number.isNaN(exp)) return true;
  return exp > Date.now();
}

/**
 * Trial está ativo se `trial_ends_at` é uma data válida no futuro.
 * Exposto para reuso em UI (ex.: TrialBanner) e cost-guards.
 */
export function isTrialActive(trialEndsAt: string | null | undefined): boolean {
  if (!trialEndsAt) return false;
  const exp = Date.parse(trialEndsAt);
  if (Number.isNaN(exp)) return false;
  return exp > Date.now();
}

export async function getPlanInfo(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<PlanInfo> {
  const { data } = await supabase
    .from('profiles')
    .select(
      'plan, plan_expires_at, trial_ends_at, questions_used_count, simulados_used_count, is_admin',
    )
    .eq('id', userId)
    .maybeSingle();

  const plan: Plan = (data?.plan as Plan | undefined) ?? 'free';
  const planExpiresAt = (data?.plan_expires_at as string | null | undefined) ?? null;
  const trialEndsAt =
    ((data as { trial_ends_at?: string | null } | null)?.trial_ends_at as string | null | undefined) ??
    null;
  return {
    plan,
    isPro: isProActive(plan, planExpiresAt),
    isAdmin: data?.is_admin === true,
    isTrial: isTrialActive(trialEndsAt),
    questionsUsed: Number(data?.questions_used_count ?? 0),
    simuladosUsed: Number(data?.simulados_used_count ?? 0),
    planExpiresAt,
    trialEndsAt,
  };
}

/**
 * Verifica se o usuário pode iniciar uma nova sessão de quiz / responder mais
 * questões. Admin (sem previewFreeMode) = ilimitado. Pro = sempre permitido.
 * Trial ativo = ilimitado (plan='trial'). Free = bloqueia quando atingir 30.
 */
export async function checkQuestionsCap(
  supabase: SupabaseClient<Database>,
  userId: string,
  options: CapOptions = {},
): Promise<CapResult> {
  const info = await getPlanInfo(supabase, userId);
  if (info.isAdmin && !options.previewFreeMode) {
    return { allowed: true, used: info.questionsUsed, limit: Infinity, plan: 'admin' };
  }
  if (info.isPro) {
    return { allowed: true, used: info.questionsUsed, limit: Infinity, plan: info.plan };
  }
  if (info.isTrial && !options.previewFreeMode) {
    return { allowed: true, used: info.questionsUsed, limit: Infinity, plan: 'trial' };
  }
  return {
    allowed: info.questionsUsed < FREE_QUESTIONS_LIMIT,
    used: info.questionsUsed,
    limit: FREE_QUESTIONS_LIMIT,
    plan: info.plan,
  };
}

/**
 * Verifica se o usuário pode iniciar um simulado.
 */
export async function checkSimuladoCap(
  supabase: SupabaseClient<Database>,
  userId: string,
  options: CapOptions = {},
): Promise<CapResult> {
  const info = await getPlanInfo(supabase, userId);
  if (info.isAdmin && !options.previewFreeMode) {
    return { allowed: true, used: info.simuladosUsed, limit: Infinity, plan: 'admin' };
  }
  if (info.isPro) {
    return { allowed: true, used: info.simuladosUsed, limit: Infinity, plan: info.plan };
  }
  if (info.isTrial && !options.previewFreeMode) {
    return { allowed: true, used: info.simuladosUsed, limit: Infinity, plan: 'trial' };
  }
  return {
    allowed: info.simuladosUsed < FREE_SIMULADOS_LIMIT,
    used: info.simuladosUsed,
    limit: FREE_SIMULADOS_LIMIT,
    plan: info.plan,
  };
}

export type UsageCounter = 'questions_used_count' | 'simulados_used_count';

/**
 * Incremento "atômico" do contador. Usa leitura+update — em alta concorrência
 * pode haver race, mas para os volumes de free tier (30 questões total) o
 * impacto é desprezível. Pro/Trial nunca incrementam.
 */
export async function incrementUsageCounter(
  supabase: SupabaseClient<Database>,
  userId: string,
  counter: UsageCounter,
  by = 1,
): Promise<void> {
  const { data } = await supabase
    .from('profiles')
    .select(
      'plan, plan_expires_at, trial_ends_at, questions_used_count, simulados_used_count, is_admin',
    )
    .eq('id', userId)
    .maybeSingle();
  if (!data) return;

  const plan = (data.plan as Plan | undefined) ?? 'free';
  const expiresAt = (data.plan_expires_at as string | null | undefined) ?? null;
  const trialEndsAt =
    ((data as { trial_ends_at?: string | null }).trial_ends_at as string | null | undefined) ?? null;
  if (data.is_admin === true) return; // Admin não conta uso.
  if (isProActive(plan, expiresAt)) return; // Pro não conta uso.
  if (isTrialActive(trialEndsAt)) return; // Trial ativo: free de cobranças/contagem.

  const current =
    counter === 'questions_used_count'
      ? Number(data.questions_used_count ?? 0)
      : Number(data.simulados_used_count ?? 0);

  const update: Partial<Database['public']['Tables']['profiles']['Update']> = {
    [counter]: current + by,
  };

  await supabase.from('profiles').update(update).eq('id', userId);
}
