/**
 * Prova ativa do usuário (`profiles.active_exam`).
 *
 * Multi-vestibular Fase 2: o app deixa de hardcodar 'unifor-medicina' e passa
 * a escopar as queries de questões pela prova que o user escolheu na /inicio.
 * Todo user existente foi backfilled pra 'unifor-medicina' na migration 0039
 * (coluna NOT NULL com default), então este helper devolve isso por padrão —
 * comportamento idêntico até existirem questões de outra prova no banco.
 *
 * Spec: docs/superpowers/specs/2026-05-09-multi-vestibular-design.md
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';

export const DEFAULT_EXAM = 'unifor-medicina';

/**
 * Lê a prova ativa do usuário. Defensivo: se a linha sumir ou o campo vier
 * vazio (não deveria, coluna é NOT NULL), cai no Unifor — nunca devolve algo
 * que quebre as queries `.eq('exam', ...)`.
 */
export async function getActiveExam(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<string> {
  const { data } = await supabase
    .from('profiles')
    .select('active_exam')
    .eq('id', userId)
    .maybeSingle();
  return (data?.active_exam as string | null | undefined) ?? DEFAULT_EXAM;
}
