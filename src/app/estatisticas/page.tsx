import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ShareButton } from '@/components/share-button';
import {
  DisciplineBarChart,
  type DisciplineRow,
} from '@/components/stats/discipline-bar-chart';
import { TopicMapMatrix } from '@/components/topic-map-matrix';
import {
  buildDisciplineProgress,
  type DisciplineProgress,
  type DisciplineTopicNode,
} from '@/lib/stats/topic-frequency';
import {
  WeeklyXpChart,
  type WeeklyXpPoint,
} from '@/components/stats/weekly-xp-chart';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserMenu } from '@/components/user-menu';
import { Card } from '@/components/ui/card';
import { WeakPointsView } from '@/components/stats/weak-points-view';
import { createClient } from '@/lib/supabase/server';
import { fetchAll } from '@/lib/supabase/fetch-all';
import { slugify } from '@/lib/slug';
import { fetchWeakPoints } from '@/lib/stats/weak-points';
import type { Discipline } from '@/lib/supabase/types';
import { DeleteAllDialog } from './_components/delete-all-dialog';
import { StatsTabs } from './_components/stats-tabs';

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

interface PageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default async function EstatisticasPage({ searchParams }: PageProps) {
  const tabParamRaw = searchParams?.tab;
  const tabParam = Array.isArray(tabParamRaw) ? tabParamRaw[0] : tabParamRaw;
  const initialTab: 'visao' | 'fracos' = tabParam === 'fracos' ? 'fracos' : 'visao';

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
    // Pagina pra contornar cap 1000 do PostgREST (1015+ rows elegíveis).
    fetchAll<{ id: string; discipline: string; subtopic: string; subtopic_short: string; annulled: boolean | null; exam: string }>(
      ({ from, to }) =>
        supabase
          .from('questions')
          .select('id, discipline, subtopic, subtopic_short, annulled, exam')
          .eq('exam', 'unifor-medicina')
          .range(from, to),
    ).then((data) => ({ data, error: null })),
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

  // Pontos fracos pessoais (gap-finder) — usado tanto pra aba "Meus pontos
  // fracos" quanto pro badge na aba.
  const weakPointsResult = await fetchWeakPoints(supabase, user.id);

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

  // Mapa de tópicos: top por disciplina (a partir de TODAS as questões disponíveis,
  // não apenas as resolvidas pelo usuário — mostra o que a banca cobra mais).
  const topicMatrixData: DisciplineTopicNode[] = DISCIPLINES.map((d) => {
    const list = subtopicsByDiscipline.get(d) ?? [];
    const topics = list
      .map((s) => ({ topic: s.subtopic_short || s.subtopic, count: s.total }))
      .sort((a, b) => b.count - a.count);
    const count = topics.reduce((acc, t) => acc + t.count, 0);
    return { discipline: d, count, topics };
  });

  // Progresso pessoal por disciplina pra mini-barra do card.
  const progressByDiscipline: Record<string, DisciplineProgress> = {};
  for (const d of DISCIPLINES) {
    const total = totalsByDiscipline.get(d) ?? 0;
    const resolved = resolvedByDiscipline.get(d) ?? { total: 0, correct: 0 };
    progressByDiscipline[d] = buildDisciplineProgress(total, resolved.total, resolved.correct);
  }

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

        {/* Big stats — inspirado no respostaCerta. Em vez de 6 cards
            pequenos uniformes, 4 cards grandes com emoji + numero
            destacado + contexto. Cada um tem sua cor accent. */}
        <section aria-labelledby="stats-cards" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <h2 id="stats-cards" className="sr-only">
            Resumo
          </h2>
          {(() => {
            const totalAttempted = totalCorrect + totalWrong;
            const accuracyPct =
              totalAttempted === 0 ? 0 : Math.round((totalCorrect / totalAttempted) * 100);
            // Vestibular Unifor tem ~60 questoes por prova. Equivalencia
            // didatica: "voce ja resolveu o equivalente a X.X provas".
            const provasEquivalentes = (totalAttempted / 60).toFixed(1);
            const currentStreak = streakRow?.current_streak ?? 0;
            const longestStreak = streakRow?.longest_streak ?? 0;
            return (
              <>
                <BigStatCard
                  emoji="📚"
                  label="Questões Feitas"
                  description="Total de questões respondidas"
                  value={formatNumber(totalAttempted)}
                  subtitle={
                    totalAttempted >= 60
                      ? `Equivale a ${provasEquivalentes} provas oficiais`
                      : 'Continue praticando'
                  }
                  accentVar="--accent-quiz"
                />
                <BigStatCard
                  emoji="⭐"
                  label="Taxa de Acertos"
                  description="Porcentagem de questões acertadas"
                  value={totalAttempted === 0 ? '—' : `${accuracyPct}%`}
                  progress={totalAttempted === 0 ? null : accuracyPct}
                  accentVar="--primary"
                />
                <BigStatCard
                  emoji="🔥"
                  label="Sequência Atual"
                  description="Dias seguidos estudando"
                  value={formatNumber(currentStreak)}
                  subtitle={
                    longestStreak > currentStreak
                      ? `Maior: ${longestStreak} ${longestStreak === 1 ? 'dia' : 'dias'}`
                      : currentStreak > 0
                      ? 'Recorde pessoal'
                      : 'Comece hoje'
                  }
                  accentVar="--warning"
                />
                <BigStatCard
                  emoji="🏆"
                  label="XP Total"
                  description="Pontos acumulados em todas as semanas"
                  value={formatNumber(totalXp)}
                  subtitle={rankingPosition === '—' ? 'Sem ranking ainda' : `Ranking ${rankingPosition} esta semana`}
                  accentVar="--accent-ranking"
                />
              </>
            );
          })()}
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

        <StatsTabs
          initialTab={initialTab}
          weakBadgeCount={weakPointsResult.weak.length}
          fracosSlot={
            <WeakPointsView
              weak={weakPointsResult.weak}
              undiagnosed={weakPointsResult.undiagnosed}
              totalAttemptsConsidered={weakPointsResult.totalAttemptsConsidered}
            />
          }
          visaoSlot={<>
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

        {/* Mapa de tópicos — cards equivalentes com selo MAIS CAI */}
        <section aria-labelledby="topic-map" className="flex flex-col gap-3">
          <div className="flex items-end justify-between">
            <h2 id="topic-map" className="text-lg font-semibold text-foreground">
              Tópicos mais cobrados
            </h2>
            <span className="text-xs text-muted-foreground">
              top-3 destacado por disciplina
            </span>
          </div>
          <Card className="p-4">
            <TopicMapMatrix
              data={topicMatrixData}
              progress={progressByDiscipline}
              mode="explore"
            />
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
          </>}
        />

        {/* Zona de perigo — zerar estatísticas */}
        <section aria-labelledby="actions" className="mt-2 flex flex-col gap-3 border-t border-border pt-6">
          <h2 id="actions" className="text-lg font-semibold text-foreground">
            Zona de perigo
          </h2>
          <p className="text-xs text-muted-foreground">
            Zerar estatísticas remove tentativas, sessões, XP, sequência e domínio de
            subtópicos. Sua conta permanece intacta.
          </p>
          <div className="flex flex-wrap gap-3">
            {username ? <DeleteAllDialog username={username} /> : null}
          </div>
        </section>
      </main>
    </div>
  );
}

/**
 * Big stat card inspirado no respostaCerta: emoji decorativo + label + numero
 * grande tipografico + descricao curta. Pode incluir uma barra de progresso
 * (taxa de acerto) ou uma linha de subtitle (contexto adicional).
 *
 * O accentVar define a cor do numero e da barra (ex: --accent-quiz, --primary,
 * --warning, --accent-ranking).
 */
function BigStatCard({
  emoji,
  label,
  description,
  value,
  subtitle,
  progress,
  accentVar,
}: {
  emoji: string;
  label: string;
  description: string;
  value: string;
  subtitle?: string;
  progress?: number | null;
  accentVar: string;
}) {
  return (
    <Card
      className="flex flex-col gap-2 border-l-4 p-5"
      style={{
        borderLeftColor: `hsl(var(${accentVar}))`,
        backgroundColor: `hsl(var(${accentVar}) / 0.04)`,
      }}
    >
      <div className="flex items-baseline gap-2">
        <span aria-hidden="true" className="text-xl">
          {emoji}
        </span>
        <span className="text-base font-semibold text-foreground">{label}</span>
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
      <span
        className="mt-1 text-4xl font-bold tabular-nums leading-none"
        style={{ color: `hsl(var(${accentVar}))` }}
      >
        {value}
      </span>
      {progress !== undefined && progress !== null ? (
        <div
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted"
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(100, Math.max(0, progress))}%`,
              backgroundColor: `hsl(var(${accentVar}))`,
            }}
          />
        </div>
      ) : null}
      {subtitle ? (
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      ) : null}
    </Card>
  );
}
