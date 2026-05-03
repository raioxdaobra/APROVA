import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DifficultyChip } from '@/components/difficulty-chip';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/server';
import { disciplineBg, disciplineLabel } from '@/app/simulado/config';
import type { AnswerLetter } from '@/lib/supabase/types';

export const metadata = {
  title: 'Resultado do simulado — APROVA',
};

export const dynamic = 'force-dynamic';

interface PageParams {
  id: string;
}

interface FiltersShape {
  total?: number;
  time_limit_sec?: number;
  question_ids?: string[];
}

function parseFilters(raw: unknown): FiltersShape | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const f = raw as Record<string, unknown>;
  return {
    total: typeof f.total === 'number' ? f.total : undefined,
    time_limit_sec:
      typeof f.time_limit_sec === 'number' ? f.time_limit_sec : undefined,
    question_ids: Array.isArray(f.question_ids)
      ? f.question_ids.filter((x): x is string => typeof x === 'string')
      : undefined,
  };
}

function formatDuration(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  if (mm >= 60) {
    const hh = Math.floor(mm / 60);
    const mmRest = mm % 60;
    return `${hh}h ${mmRest.toString().padStart(2, '0')}min`;
  }
  return `${mm}min ${ss.toString().padStart(2, '0')}s`;
}

export default async function ResultadoPage({
  params,
}: {
  params: PageParams;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/');
  }

  const { data: session, error: sErr } = await supabase
    .from('study_sessions')
    .select(
      'id, user_id, type, started_at, ended_at, total_questions, correct_count, duration_sec, filters',
    )
    .eq('id', params.id)
    .maybeSingle();

  if (sErr || !session) notFound();
  if (session.user_id !== user.id || session.type !== 'simulado') notFound();

  // Se ainda em andamento, manda de volta para o runner.
  if (!session.ended_at) {
    redirect(`/simulado/sessao/${session.id}`);
  }

  const filters = parseFilters(session.filters);
  const filterIds = filters?.question_ids ?? [];
  const totalQuestions = session.total_questions ?? filterIds.length ?? 0;
  const correctCount = session.correct_count ?? 0;
  const durationSec = session.duration_sec ?? 0;

  const { data: attempts, error: aErr } = await supabase
    .from('attempts')
    .select(
      'question_id, answer, is_correct, questions:question_id(id, discipline, subtopic, subtopic_short, year, semester, question_num, correct_answer)',
    )
    .eq('session_id', session.id);
  if (aErr) {
    throw new Error('Falha ao carregar tentativas do simulado.');
  }

  type Joined = {
    question_id: string;
    answer: AnswerLetter | null;
    is_correct: boolean | null;
    questions: {
      id: string;
      discipline: string;
      subtopic: string;
      subtopic_short: string;
      year: number;
      semester: number;
      question_num: number;
      correct_answer: AnswerLetter | null;
    } | null;
  };

  const attemptList = (attempts ?? []) as unknown as Joined[];

  // Estatísticas globais (chip de dificuldade). Tolera ausência da view.
  const statsById = new Map<string, number>();
  if (attemptList.length > 0) {
    try {
      const ids = attemptList.map((a) => a.question_id);
      type StatsRow = { question_id: string; correct_pct: number | null };
      type StatsQuery = {
        from: (table: 'question_stats') => {
          select: (cols: string) => {
            in: (col: string, vals: string[]) => Promise<{ data: StatsRow[] | null }>;
          };
        };
      };
      const sb = supabase as unknown as StatsQuery;
      const { data: statsRows } = await sb
        .from('question_stats')
        .select('question_id, correct_pct')
        .in('question_id', ids);
      for (const row of statsRows ?? []) {
        if (typeof row.correct_pct === 'number') {
          statsById.set(row.question_id, row.correct_pct);
        }
      }
    } catch {
      // ignora
    }
  }

  // Ordenar pela ordem do filters.question_ids para apresentação consistente.
  const orderIndex = new Map<string, number>();
  filterIds.forEach((id, idx) => orderIndex.set(id, idx));
  const sortedAttempts = [...attemptList].sort((a, b) => {
    const ia = orderIndex.get(a.question_id) ?? 999_999;
    const ib = orderIndex.get(b.question_id) ?? 999_999;
    return ia - ib;
  });

  // Stats principais
  let blanks = 0;
  let wrongs = 0;
  for (const a of sortedAttempts) {
    if (a.answer === null) blanks += 1;
    else if (a.is_correct === false) wrongs += 1;
  }
  // Caso o total registrado em sessão seja maior que attempts (nunca deve, mas defensivo)
  const totalForRate = totalQuestions > 0 ? totalQuestions : sortedAttempts.length;
  const accuracy =
    totalForRate > 0 ? Math.round((correctCount / totalForRate) * 100) : 0;

  // Breakdown por disciplina
  type Bucket = { discipline: string; n: number; correct: number; wrong: number };
  const byDiscipline = new Map<string, Bucket>();
  for (const a of sortedAttempts) {
    const d = a.questions?.discipline ?? 'desconhecida';
    const cur = byDiscipline.get(d) ?? {
      discipline: d,
      n: 0,
      correct: 0,
      wrong: 0,
    };
    cur.n += 1;
    if (a.is_correct === true) cur.correct += 1;
    else if (a.is_correct === false) cur.wrong += 1;
    byDiscipline.set(d, cur);
  }
  const breakdownRows = Array.from(byDiscipline.values()).sort(
    (a, b) => b.n - a.n,
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-4 px-4 py-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">
          Resultado do simulado
        </h1>
        <p className="text-sm text-muted-foreground">
          {correctCount} de {totalForRate} acertos · {accuracy}% de aproveitamento
        </p>
      </header>

      <Card className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-5">
        <Stat label="Acertos" value={String(correctCount)} tone="success" />
        <Stat label="Erros" value={String(wrongs)} tone="error" />
        <Stat label="Em branco" value={String(blanks)} tone="muted" />
        <Stat label="Aproveitamento" value={`${accuracy}%`} />
        <Stat label="Tempo gasto" value={formatDuration(durationSec)} />
      </Card>

      <Card className="p-5">
        <h2 className="mb-3 text-lg font-semibold text-foreground">
          Por disciplina
        </h2>
        {breakdownRows.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem dados.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="py-2">Disciplina</th>
                <th className="py-2 text-right">N</th>
                <th className="py-2 text-right">Acertos</th>
                <th className="py-2 text-right">Erros</th>
                <th className="py-2 text-right">%</th>
              </tr>
            </thead>
            <tbody>
              {breakdownRows.map((row) => {
                const pct = row.n > 0 ? Math.round((row.correct / row.n) * 100) : 0;
                return (
                  <tr key={row.discipline} className="border-b border-border">
                    <td className="py-2">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold text-white',
                          disciplineBg(row.discipline),
                        )}
                      >
                        {disciplineLabel(row.discipline)}
                      </span>
                    </td>
                    <td className="py-2 text-right tabular-nums">{row.n}</td>
                    <td className="py-2 text-right tabular-nums text-success">
                      {row.correct}
                    </td>
                    <td className="py-2 text-right tabular-nums text-error">
                      {row.wrong}
                    </td>
                    <td className="py-2 text-right tabular-nums">{pct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      <Card className="p-5">
        <h2 className="mb-3 text-lg font-semibold text-foreground">
          Questão a questão
        </h2>
        <ul className="flex flex-col gap-2">
          {sortedAttempts.map((a, idx) => {
            const q = a.questions;
            const isCorrect = a.is_correct === true;
            const isWrong = a.is_correct === false;
            const isBlank = a.answer === null;
            const borderTone = isCorrect
              ? 'border-l-success'
              : isWrong
                ? 'border-l-error'
                : 'border-l-neutral-200';
            return (
              // TODO: link to review when PR 5 lands
              <li
                key={a.question_id}
                className={cn(
                  'flex items-center gap-3 rounded-md border border-border border-l-4 bg-card px-3 py-2 text-sm',
                  borderTone,
                )}
              >
                <span className="w-6 text-xs font-semibold text-muted-foreground tabular-nums">
                  {idx + 1}
                </span>
                {q ? (
                  <span
                    className={cn(
                      'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold text-white',
                      disciplineBg(q.discipline),
                    )}
                  >
                    {disciplineLabel(q.discipline)}
                  </span>
                ) : null}
                <span className="flex-1 truncate text-muted-foreground">
                  {q?.subtopic_short ?? q?.subtopic ?? '—'}
                </span>
                <DifficultyChip
                  correct_pct={statsById.has(a.question_id) ? statsById.get(a.question_id)! : null}
                  className="shrink-0"
                />
                <span className="flex shrink-0 items-center gap-1 text-xs">
                  <span
                    className={cn(
                      'tabular-nums',
                      isCorrect
                        ? 'text-success'
                        : isWrong
                          ? 'text-error'
                          : 'text-muted-foreground',
                    )}
                  >
                    {isBlank ? '—' : (a.answer ?? '—')}
                  </span>
                  <span className="text-muted-foreground">/</span>
                  <span className="tabular-nums text-foreground">
                    {q?.correct_answer ?? '—'}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button asChild size="lg" className="w-full sm:flex-1">
          <Link href="/simulado">Novo simulado</Link>
        </Button>
        <Button
          asChild
          variant="secondary"
          size="lg"
          className="w-full sm:flex-1"
        >
          <Link href="/dashboard">Voltar para o início</Link>
        </Button>
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'success' | 'error' | 'muted';
}) {
  const valueClass =
    tone === 'success'
      ? 'text-success'
      : tone === 'error'
        ? 'text-error'
        : tone === 'muted'
          ? 'text-muted-foreground'
          : 'text-foreground';
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn('text-2xl font-semibold tabular-nums', valueClass)}>
        {value}
      </span>
    </div>
  );
}
