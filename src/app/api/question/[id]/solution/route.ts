/**
 * GET resolução de uma questão.
 *
 * - Tenta cache em `question_solutions`.
 * - Se vazio: gera on-demand via chain LLM, persiste e retorna.
 * - Em caso de falha total (LLM down + sem cache), retorna { solution: null }
 *   pra o cliente exibir o placeholder "em preparação".
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOrGenerateResolucao } from '@/lib/llm/on-demand';
import type { SupabaseClient } from '@supabase/supabase-js';

type AnyDb = SupabaseClient;

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
// Vercel hobby cap = 60s; usamos 30s pra deixar margem.
export const maxDuration = 30;

export async function GET(
  _req: Request,
  context: { params: { id: string } },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const questionId = context.params.id;

  // Carrega contexto da questão (necessário pra prompt + gabarito)
  const { data: question } = await (supabase as AnyDb)
    .from('questions')
    .select('discipline, subtopic, correct_answer')
    .eq('id', questionId)
    .maybeSingle();

  const ctx = {
    questionId,
    discipline: (question as { discipline?: string | null } | null)?.discipline ?? null,
    subtopic: (question as { subtopic?: string | null } | null)?.subtopic ?? null,
    correctAnswer:
      (question as { correct_answer?: string | null } | null)?.correct_answer ?? null,
  };

  const solution = await getOrGenerateResolucao(supabase, ctx);
  return NextResponse.json({ solution: solution ?? null });
}
