/**
 * Painel de resolução pré-gerada de uma questão.
 * Server Component — busca direto via supabase server.
 */
import { createClient } from '@/lib/supabase/server';
import { MarkdownKatex } from './markdown-katex';
import type { SupabaseClient } from '@supabase/supabase-js';

type AnyDb = SupabaseClient;

interface Props {
  questionId: string;
}

export async function SolutionPanel({ questionId }: Props) {
  const supabase = await createClient();
  const { data } = await (supabase as AnyDb)
    .from('question_solutions')
    .select('content_md, conclusion, generated_by, reviewed')
    .eq('question_id', questionId)
    .maybeSingle();

  const row = data as
    | { content_md: string; conclusion: string; generated_by: string; reviewed: boolean }
    | null;

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
