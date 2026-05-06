import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ShareButton } from '@/components/share-button';
import {
  DisciplineBarChart,
  type DisciplineRow,
} from '@/components/stats/discipline-bar-chart';
import {
  TopicTreemap,
  type DisciplineTreeNode,
} from '@/components/stats/topic-treemap';
import {
  WeeklyXpChart,
  type WeeklyXpPoint,
} from '@/components/stats/weekly-xp-chart';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserMenu } from '@/components/user-menu';
import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/slug';
import type { Discipline } from '@/lib/supabase/types';
import { DeleteAllDialog } from './_components/delete-all-dialog';
import { ExportButton } from './_components/export-button';

export const metadata = {
  title: 'Estatísticas — APROVA',
};

export const dynamic = 'force-dynamic';

const DISCIPLINE_LABEL: Record<Discipline, string> = {
  matematica: 'Matemática',
  fisica: 'Física',
  quimica: 'Química',
  biologia: 'Biologia',
  humanas: 'Humanas',
  linguagens: 'Linguagens',
};

const DISCIPLINES: Discipline[] = [
  'matematica',
  'fisica',
  'quimica',
  'biologia',
  'humanas',
  'linguagens',
];

const FORTALEZA_TZ = 'America/Fortaleza';

interface AttemptRow {
  is_correct: boolean | null;
  context: string;
  created_at: string | null;
  question_id: string;
}

interface QuestionRow {
  id: string;
  discipline: string;
  subtopic: string;
  subtopic_short: string;
  annulled: boolean | null;
  exam: string;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}

function formatPercent(numerator: number, denominator: number): string {
  if (denominator === 0) return '—';
  return `${Math.round((numerator / denominator) * 100)}%`;
}

/**
 * ISO-style Monday-anchored week start in America/Fortaleza tz.
 * Mirrors `date_trunc('week', ...)` which Postgres anchors to Monday.
 */
function weekStartInFortaleza(iso: string): string {
  const d = new Date(iso);
  // Construir uma data "no fuso de Fortaleza" usando partes locais.
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: FORTALEZA_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  });
  const parts = fmt.formatToParts(d);
  const year = parts.find((p) => p.type === 'year')?.value ?? '1970';
  const month = parts.find((p) => p.type === 'month')?.value ?? '01';
  const day = parts.find((p) => p.type === 'day')?.value ?? '01';
  const weekday = parts.find((p) => p.type === 'weekday')?.value ?? 'Mon';
  // weekday em en-US: Sun, Mon, Tue, Wed, Thu, Fri, Sat
  const map: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };
  const offset = map[weekday] ?? 0;
  const date = new Date(`${year}-${month}-${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - offset);
  return date.toISOString().slice(0, 10);
}

function lastNWeekStarts(n: number, fromIso?: string): string[] {
  const baseIso = fromIso ?? new Date().toISOString();
  const currentStart = weekStartInFortaleza(baseIso);
  const result: string[] = [];
  const base = new Date(`${currentStart}T00:00:00Z`);
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date(base);
    d.setUTCDate(d.getUTCDate() - i * 7);
    result.push(d.toISOString().slice(0, 10));
  }
  return result;
}

function formatWeekLabel(iso: string): string {
  // Semana ISO de uma data dada. Aproximação: número da semana baseada no
  // número de dias desde 1 de janeiro / 7 + 1, com âncora segunda.
  const d = new Date(`${iso}T00:00:00Z`);
  const start = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const diffDays = Math.floor((d.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
  const week = Math.max(1, Math.ceil((diffDays + 1) / 7));
  return `S${week}`;
}

export default async function EstatisticasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/');
  }

  const twelveWeeksAgo = new Date();
  twelveWeeksAgo.setUTCDate(twelveWeeksAgo.getUTCDate() - 12 * 7);
  const twelveWeeksAgoIso = twelveWeeksAgo.toISOString();

  const [
    { data: profile },
    { data: streakRow },
    { data: weeklyXpRows },
    { data: attemptsAll },
    { data: attemptsRecent },
    { data: questionsAll },
    { data: masteryRows },
    { data: leaderboardRows },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('username, display_name, is_public_in_leaderboard, is_admin')
      .eq('id', user.id)
      .maybeSingle(),
    supabase
      .from('streaks')
      .select('current_streak, longest_streak')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('weekly_xp')
      .select('week_start, xp, questions_answered')
      .eq('user_id', user.id),
    supabase
      .from('attempts')
      .select('is_correct, context, created_at, question_id')
      .eq('user_id', user.id),
    supabase
      .from('attempts')
      .select('is_correct, context, created_at, question_id')
      .eq('user_id', user.id)
      .neq('context', 'diagnostic')
      .gt('created_at', twelveWeeksAgoIso),
    supabase
      .from('questions')
      .select('id, discipline, subtopic, subtopic_short, annulled, exam')
      .eq('exam', 'unifor-medicina'),
    supabase
      .from('subtopic_mastery')
      .select('discipline, subtopic')
      .eq('user_id', user.id),
    supabase
      .from('weekly_leaderboard')
      .select('username, position, week_start')
      .order('position', { ascending: true })
      .limit(500),
  ]);

  const username = profile?.username ?? null;
  const displayName = profile?.display_name ?? username ?? 'estudante';

  const attempts: AttemptRow[] = (attemptsAll ?? []).map((a) => ({
    is_correct: a.is_correct,
    context: a.context,
    created_at: a.created_at,
    question_id: a.question_id,
  }));

  const totalCorrect = attempts.filter(
    (a) => a.context !== 'diagnostic' && a.is_correct === true,
  ).length;
  const totalWrong = attempts.filter(
    (a) => a.context !== 'diagnostic' && a.is_correct === false,
  ).length;

  const totalXp = (weeklyXpRows ?? []).reduce((sum, row) => sum + (row.xp ?? 0), 0);

  // Posição no ranking semanal — semana corrente, somente se o usuário tem perfil público.
  const currentWeekStart = weekStartInFortaleza(new Date().toISOString());
  const myLeaderboardRow = (leaderboardRows ?? []).find(
    (r) => r.username === username && r.week_start === currentWeekStart,
  );
  const rankingPosition =
    profile?.is_public_in_leaderboard && myLeaderboardRow
      ? `#${myLeaderboardRow.position}`
      : '—';

  // Gráfico de evolução semanal (12 semanas)
  const weekStarts = lastNWeekStarts(12);
  const weekBuckets = new Map<string, { total: number; correct: number }>();
  for (const ws of weekStarts) weekBuckets.set(ws, { total: 0, correct: 0 });

  for (const a of attemptsRecent ?? []) {
    if (a.context === 'diagnostic') continue;
    if (!a.created_at) continue;
    const ws = weekStartInFortaleza(a.created_at);
    const bucket = weekBuckets.get(ws);
    if (!bucket) continue;
    bucket.total += 1;
    if (a.is_correct === true) bucket.correct += 1;
  }

  // Pontos para o LineChart de XP semanal
  const xpByWeekStart = new Map<string, number>();
  for (const row of weeklyXpRows ?? []) {
    if (!row.week_start) continue;
    xpByWeekStart.set(row.week_start, (xpByWeekStart.get(row.week_start) ?? 0) + (row.xp ?? 0));
  }
  const weeklyXpPoints: WeeklyXpPoint[] = weekStarts.map((ws) => {
    const bucket = weekBuckets.get(ws) ?? { total: 0, correct: 0 };
    const accuracy = bucket.total === 0 ? null : Math.round((bucket.correct / bucket.total) * 100);
    return {
      weekStart: ws,
      weekLabel: formatWeekLabel(ws),
      xp: xpByWeekStart.get(ws) ?? 0,
      questions: bucket.total,
      accuracyPct: accuracy,
    };
  });

  // Tabela por disciplina
  const allQuestions: QuestionRow[] = (questionsAll ?? []).filter((q) => !q.annulled);
  const totalsByDiscipline = new Map<string, number>();
  const totalsBySubtopic = new Map<string, { discipline: string; total: number; subtopic_short: string }>();
  for (const q of allQuestions) {
    totalsByDiscipline.set(q.discipline, (totalsByDiscipline.get(q.discipline) ?? 0) + 1);
    const key = `${q.discipline}::${q.subtopic}`;
    const existing = totalsBySubtopic.get(key);
    if (existing) existing.total += 1;
    else totalsBySubtopic.set(key, { discipline: q.discipline, total: 1, subtopic_short: q.subtopic_short });
  }

  const questionsById = new Map<string, QuestionRow>();
  for (const q of allQuestions) questionsById.set(q.id, q);

  // Para "resolvidas" e "% acerto" por disciplina/subtópico, considere a tentativa mais recente
  // por questão do usuário (excluindo diagnostic).
  const latestAttemptByQuestion = new Map<string, AttemptRow>();
  for (const a of attempts) {
    if (a.context === 'diagnostic') continue;
    const prev = latestAttemptByQuestion.get(a.question_id);
    if (!prev) {
      latestAttemptByQuestion.set(a.question_id, a);
      continue;
    }
    const prevTs = prev.created_at ? Date.parse(prev.created_at) : 0;
    const currTs = a.created_at ? Date.parse(a.created_at) : 0;
    if (currTs >= prevTs) latestAttemptByQuestion.set(a.question_id, a);
  }

  const resolvedByDiscipline = new Map<string, { total: number; correct: number }>();
  const resolvedBySubtopic = new Map<string, { total: number; correct: number }>();

  for (const [questionId, attempt] of latestAttemptByQuestion) {
    const q = questionsById.get(questionId);
    if (!q) continue;
    const dKey = q.discipline;
    const sKey = `${q.discipline}::${q.subtopic}`;
    const dRow = resolvedByDiscipline.get(dKey) ?? { total: 0, correct: 0 };
    dRow.total += 1;
    if (attempt.is_correct === true) dRow.correct += 1;
    resolvedByDiscipline.set(dKey, dRow);

    const sRow = resolvedBySubtopic.get(sKey) ?? { total: 0, correct: 0 };
    sRow.total += 1;
    if (attempt.is_correct === true) sRow.correct += 1;
    resolvedBySubtopic.set(sKey, sRow);
  }

  const masterySet = new Set(
    (masteryRows ?? []).map((m) => `${m.discipline}::${m.subtopic}`),
  );

  // Agrupar subtopicos por disciplina para a tabela detalhada
  const subtopicsByDiscipline = new Map<
    string,
    Array<{
      subtopic: string;
      subtopic_short: string;
      total: number;
      resolved: number;
      correct: number;
      mastered: boolean;
    }>
  >();
  for (const [key, value] of totalsBySubtopic) {
    const [discipline, subtopic] = key.split('::') as [string, string];
    const resolved = resolvedBySubtopic.get(key) ?? { total: 0, correct: 0 };
    const list = subtopicsByDiscipline.get(discipline) ?? [];
    list.push({
      subtopic,
      subtopic_short: value.subtopic_short,
      total: value.total,
      resolved: resolved.total,
      correct: resolved.correct,
      mastered: masterySet.has(key),
    });
    subtopicsByDiscipline.set(discipline, list);
  }
  for (const list of subtopicsByDiscipline.values()) {
    list.sort((a, b) => a.subtopic_short.localeCompare(b.subtopic_short, 'pt-BR'));
  }

  // Linha de dados pro gráfico de barras por disciplina
  const disciplineChartRows: DisciplineRow[] = DISCIPLINES.map((d) => {
    const total = totalsByDiscipline.get(d) ?? 0;
    const resolved = resolvedByDiscipline.get(d) ?? { total: 0, correct: 0 };
    return {
      discipline: d,
      total,
      resolved: resolved.total,
      correct: resolved.correct,
    };
  });

  // Treemap: top tópicos por disciplina (a partir de TODAS as questões disponíveis,
  // não apenas as resolvidas pelo usuário — mostra o que a banca cobra mais).
  const treemapData: DisciplineTreeNode[] = DISCIPLINES.map((d) => {
    const list = subtopicsByDiscipline.get(d) ?? [];
    const topics = list
      .map((s) => ({ topic: s.subtopic_short || s.subtopic, count: s.total }))
      .sort((a, b) => b.count - a.count);
    const count = topics.reduce((acc, t) => acc + t.count, 0);
    return { discipline: d, count, topics };
  })
    .filter((node) => node.count > 0)
    .sort((a, b) => b.count - a.count);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-4xl items-start justify-between gap-4 px-4 py-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-foreground">Estatísticas</h1>
          <p className="text-sm text-muted-foreground">
            Seu progresso, semana a semana e por disciplina.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu displayName={displayName} isAdmin={profile?.is_admin === true} />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 pb-10">
        <nav aria-label="Navegação" className="flex flex-wrap gap-2 text-sm">
          <Link
            href="/dashboard"
            className="rounded border border-border bg-card px-3 py-1.5 hover:bg-muted"
          >
            Início
          </Link>
          <Link
            href="/ranking"
            className="rounded border border-border bg-card px-3 py-1.5 hover:bg-muted"
          >
            Ranking semanal
          </Link>
        </nav>

        {/* Cards grid */}
        <section aria-labelledby="stats-cards" className="grid grid-cols-2 gap-3 md:grid-cols-6">
          <h2 id="stats-cards" className="sr-only">
            Resumo
          </h2>
          <StatCard label="Acertos" value={formatNumber(totalCorrect)} />
          <StatCard label="Erros" value={formatNumber(totalWrong)} />
          <StatCard label="Sequência atual" value={formatNumber(streakRow?.current_streak ?? 0)} />
          <StatCard label="Maior sequência" value={formatNumber(streakRow?.longest_streak ?? 0)} />
          <StatCard label="XP total" value={formatNumber(totalXp)} />
          <StatCard label="Ranking" value={rankingPosition} />
        </section>

        {(streakRow?.current_streak ?? 0) > 0 ? (
          <div className="-mt-3 flex items-center justify-end">
            <ShareButton
              type="streak"
              value={streakRow?.current_streak ?? 0}
              user={username}
              label="Compartilhar sequência"
            />
          </div>
        ) : null}

        {/* Gráfico semanal — XP ao longo do tempo */}
        <section aria-labelledby="weekly-chart" className="flex flex-col gap-3">
          <div className="flex items-end justify-between">
            <h2 id="weekly-chart" className="text-lg font-semibold text-foreground">
              Evolução semanal
            </h2>
            <span className="text-xs text-muted-foreground">XP nas últimas 12 semanas</span>
          </div>
          <Card className="p-4">
            <WeeklyXpChart points={weeklyXpPoints} />
          </Card>
        </section>

        {/* Acerto por disciplina — barras coloridas */}
        <section aria-labelledby="discipline-chart" className="flex flex-col gap-3">
          <div className="flex items-end justify-between">
            <h2 id="discipline-chart" className="text-lg font-semibold text-foreground">
              Acerto por disciplina
            </h2>
            <span className="text-xs text-muted-foreground">% de acerto sobre resolvidas</span>
          </div>
          <Card className="p-4">
            <DisciplineBarChart rows={disciplineChartRows} />
          </Card>
        </section>

        {/* Treemap de tópicos mais cobrados */}
        <section aria-labelledby="topic-treemap" className="flex flex-col gap-3">
          <div className="flex items-end justify-between">
            <h2 id="topic-treemap" className="text-lg font-semibold text-foreground">
              Tópicos mais cobrados
            </h2>
            <span className="text-xs text-muted-foreground">clique numa disciplina pra expandir</span>
          </div>
          <Card className="p-4">
            <TopicTreemap data={treemapData} topicsPerDiscipline={8} />
          </Card>
        </section>

        {/* Tabela por disciplina */}
        <section aria-labelledby="by-discipline" className="flex flex-col gap-3">
          <h2 id="by-discipline" className="text-lg font-semibold text-foreground">
            Por disciplina
          </h2>
          <Card className="overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2 font-semibold">Disciplina</th>
                  <th className="px-3 py-2 font-semibold">Disponíveis</th>
                  <th className="px-3 py-2 font-semibold">Resolvidas</th>
                  <th className="px-3 py-2 font-semibold">% acerto</th>
                  <th className="px-3 py-2 font-semibold">Progresso</th>
                </tr>
              </thead>
              <tbody>
                {DISCIPLINES.map((d) => {
                  const total = totalsByDiscipline.get(d) ?? 0;
                  const resolved = resolvedByDiscipline.get(d) ?? { total: 0, correct: 0 };
                  const pct = total === 0 ? 0 : Math.min(100, (resolved.total / total) * 100);
                  return (
                    <tr key={d} className="border-b border-border last:border-0">
                      <td className="px-3 py-2.5 font-medium text-foreground">
                        {DISCIPLINE_LABEL[d]}
                      </td>
                      <td className="px-3 py-2.5 tabular-nums text-muted-foreground">
                        {formatNumber(total)}
                      </td>
                      <td className="px-3 py-2.5 tabular-nums text-foreground">
                        {formatNumber(resolved.total)}
                      </td>
                      <td className="px-3 py-2.5 tabular-nums text-foreground">
                        {formatPercent(resolved.correct, resolved.total)}
                      </td>
                      <td className="px-3 py-2.5">
                        <div
                          className="h-2 w-full overflow-hidden rounded-full bg-muted"
                          role="progressbar"
                          aria-valuenow={Math.round(pct)}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`Progresso em ${DISCIPLINE_LABEL[d]}: ${Math.round(pct)}%`}
                        >
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </section>

        {/* Subtopicos */}
        <section aria-labelledby="by-subtopic" className="flex flex-col gap-3">
          <h2 id="by-subtopic" className="text-lg font-semibold text-foreground">
            Por subtópico
          </h2>
          <div className="flex flex-col gap-2">
            {DISCIPLINES.filter((d) => (subtopicsByDiscipline.get(d) ?? []).length > 0).map(
              (d, idx) => {
                const list = subtopicsByDiscipline.get(d) ?? [];
                const totalAvail = list.reduce((s, x) => s + x.total, 0);
                const totalResolved = list.reduce((s, x) => s + x.resolved, 0);
                return (
                  <details
                    key={d}
                    className="group rounded-lg border border-border bg-card"
                    {...(idx === 0 ? { open: true } : {})}
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted/50">
                      <span>{DISCIPLINE_LABEL[d]}</span>
                      <span className="text-xs font-normal text-muted-foreground">
                        {formatNumber(totalResolved)} / {formatNumber(totalAvail)} resolvidas
                      </span>
                    </summary>
                    <div className="overflow-x-auto border-t border-border">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                            <th className="px-3 py-2 font-semibold">Subtópico</th>
                            <th className="px-3 py-2 font-semibold">Resolvidas</th>
                            <th className="px-3 py-2 font-semibold">% acerto</th>
                            <th className="px-3 py-2 text-center font-semibold">Domínio</th>
                          </tr>
                        </thead>
                        <tbody>
                          {list.map((s) => {
                            const slug = slugify(s.subtopic_short || s.subtopic);
                            const href = `/aprofundar/${d}/${slug}`;
                            return (
                              <tr
                                key={`${d}-${s.subtopic}`}
                                className="border-b border-border last:border-0 hover:bg-muted/40"
                              >
                                <td className="px-3 py-2 text-foreground">
                                  <Link
                                    href={href}
                                    className="block text-primary hover:underline"
                                  >
                                    {s.subtopic_short}
                                  </Link>
                                </td>
                                <td className="px-3 py-2 tabular-nums text-foreground">
                                  <Link href={href} className="block">
                                    {formatNumber(s.resolved)} / {formatNumber(s.total)}
                                  </Link>
                                </td>
                                <td className="px-3 py-2 tabular-nums text-foreground">
                                  <Link href={href} className="block">
                                    {formatPercent(s.correct, s.resolved)}
                                  </Link>
                                </td>
                                <td className="px-3 py-2 text-center">
                                  {s.mastered ? (
                                    <span
                                      aria-label="Domínio confirmado"
                                      title="Domínio confirmado"
                                      className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-success-bg text-xs text-success"
                                    >
                                      ✓
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground" aria-hidden>
                                      —
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </details>
                );
              },
            )}
          </div>
        </section>

        {/* Ações */}
        <section aria-labelledby="actions" className="mt-2 flex flex-col gap-3 border-t border-border pt-6">
          <h2 id="actions" className="text-lg font-semibold text-foreground">
            Ações
          </h2>
          <div className="flex flex-wrap gap-3">
            <ExportButton />
            {username ? (
              <DeleteAllDialog username={username} />
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">
            Exportar baixa um JSON com todo o seu progresso. Apagar remove
            tentativas, sessões, XP, sequência e domínio — sua conta permanece.
          </p>
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="flex flex-col gap-1 p-4">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-2xl font-semibold tabular-nums text-foreground">
        {value}
      </span>
    </Card>
  );
}
