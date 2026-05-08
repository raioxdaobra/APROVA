/**
 * Painel de resolução pré-gerada de uma questão.
 * Server Component — busca via cache; se vazio, gera on-demand via IA.
 */
import { createClient } from '@/lib/supabase/server';
import { getOrGenerateResolucao } from '@/lib/llm/on-demand';
import { MarkdownKatex } from './markdown-katex';
import type { SupabaseClient } from '@supabase/supabase-js';

type AnyDb = SupabaseClient;

interface Props {
  questionId: string;
}

export async function SolutionPanel({ questionId }: Props) {
  const supabase = await createClient();

  // Pega contexto da questão (gabarito + subtópico) pra alimentar o prompt
  const { data: question } = await (supabase as AnyDb)
    .from('questions')
    .select('discipline, subtopic, correct_answer')
    .eq('id', questionId)
    .maybeSingle();

  const ctx = {
    questionId,
    discipline:
      (question as { discipline?: string | null } | null)?.discipline ?? null,
    subtopic:
      (question as { subtopic?: string | null } | null)?.subtopic ?? null,
    correctAnswer:
      (question as { correct_answer?: string | null } | null)?.correct_answer ??
      null,
  };

  const row = await getOrGenerateResolucao(supabase, ctx);

  if (!row?.content_md) {
    return (
      <div className="rounded-md border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        Resolução em preparação. Volte em breve!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <MarkdownKatex>{row.content_md}</MarkdownKatex>
      {row.reviewed === false ? (
        <p className="text-xs text-muted-foreground">
          Resolução gerada por IA — pode conter imprecisões. Trate como apoio,
          não como gabarito.
        </p>
      ) : null}
    </div>
  );
}
