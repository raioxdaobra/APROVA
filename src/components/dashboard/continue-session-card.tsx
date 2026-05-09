/**
 * Card "Continuar de onde parou" — só aparece se houver sessão aberta nas últimas 24h.
 * Caso contrário renderiza null (some).
 *
 * Server component que faz a query. Encaixa no fluxo de hierarquia visual:
 * só rouba atenção quando faz sentido pro user.
 */
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';

const DAY_MS = 24 * 60 * 60 * 1000;

interface OpenSession {
  id: string;
  type: 'quiz' | 'simulado' | 'diagnostic' | 'revisao';
  href: string;
  label: string;
  progress: string;
}

const TYPE_LABEL: Record<string, string> = {
  quiz: 'Resolver questões',
  simulado: 'Simulado',
  diagnostic: 'Diagnóstico',
  revisao: 'Revisão',
};

const TYPE_ACCENT: Record<string, string> = {
  quiz: '--accent-quiz',
  simulado: '--accent-simulado',
  diagnostic: '--primary',
  revisao: '--accent-chat',
};

export async function ContinueSessionCard({ userId }: { userId: string }) {
  const supabase = await createClient();
  const cutoffIso = new Date(Date.now() - DAY_MS).toISOString();

  const { data: session } = await supabase
    .from('study_sessions')
    .select('id, type, started_at, ended_at, total_questions, filters')
    .eq('user_id', userId)
    .is('ended_at', null)
    .gt('started_at', cutoffIso)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!session) return null;

  // Calcula progresso: quantas attempts vs total da sessão
  const totalQuestions =
    typeof session.total_questions === 'number' && session.total_questions > 0
      ? session.total_questions
      : extractTotalFromFilters(session.filters);

  let answered = 0;
  if (totalQuestions > 0) {
    const { count } = await supabase
      .from('attempts')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', session.id)
      .eq('user_id', userId);
    answered = count ?? 0;
  }

  const type = (session.type ?? 'quiz') as OpenSession['type'];
  const href =
    type === 'simulado'
      ? `/simulado/sessao/${session.id}`
      : type === 'diagnostic'
        ? `/diagnostico`
        : `/quiz/sessao/${session.id}`;

  const label = TYPE_LABEL[type] ?? 'Sessão';
  const progress =
    totalQuestions > 0 ? `${answered}/${totalQuestions} respondidas` : 'em andamento';

  const accent = TYPE_ACCENT[type] ?? '--primary';

  return (
    <Link href={href} className="group block">
      <Card
        className="flex items-center gap-3 border-l-4 p-4 transition-colors hover:bg-muted/50"
        style={{ borderLeftColor: `hsl(var(${accent}))` }}
      >
        <div className="flex flex-1 flex-col gap-0.5">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Continuar de onde parou
          </span>
          <span className="text-sm font-semibold text-foreground">
            {label} · {progress}
          </span>
        </div>
        <ArrowRight
          className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
          aria-hidden="true"
        />
      </Card>
    </Link>
  );
}

function extractTotalFromFilters(filters: unknown): number {
  if (!filters || typeof filters !== 'object') return 0;
  const f = filters as Record<string, unknown>;
  if (typeof f.total === 'number') return f.total;
  if (Array.isArray(f.question_ids)) return f.question_ids.length;
  return 0;
}
