'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Target, Flame, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { startTopicsQuizAndRedirect } from '@/app/quiz/actions';
import type { Discipline } from '@/lib/supabase/types';
import type { WeakPoint, UndiagnosedTopic } from '@/lib/stats/weak-points';

const DISCIPLINE_LABEL: Record<Discipline, string> = {
  matematica: 'Matemática',
  fisica: 'Física',
  quimica: 'Química',
  biologia: 'Biologia',
  humanas: 'Humanas',
  linguagens: 'Linguagens',
};

const ACCENT_VARS: Record<Discipline, string> = {
  matematica: '--accent-quiz',
  fisica: '--accent-simulado',
  quimica: '--accent-trilha',
  biologia: '--accent-chat',
  humanas: '--accent-jogos',
  linguagens: '--accent-ranking',
};

interface Props {
  weak: WeakPoint[];
  undiagnosed: UndiagnosedTopic[];
  totalAttemptsConsidered: number;
}

function accuracyClass(pct: number): string {
  if (pct < 50) return 'text-rose-500 dark:text-rose-400';
  if (pct < 60) return 'text-amber-500 dark:text-amber-400';
  return 'text-foreground';
}

export function WeakPointsView({
  weak,
  undiagnosed,
  totalAttemptsConsidered,
}: Props) {
  const router = useRouter();
  const [submitting, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showUndiagnosed, setShowUndiagnosed] = useState(false);

  function trainAll() {
    if (weak.length === 0) return;
    setErrorMsg(null);
    const topics = weak.map((w) => ({
      discipline: w.discipline,
      subtopic: w.topic,
    }));
    startTransition(async () => {
      try {
        await startTopicsQuizAndRedirect({ topics, mode: 'aleatorio' });
      } catch (err) {
        setErrorMsg(
          err instanceof Error ? err.message : 'Falha ao iniciar treino.',
        );
      }
    });
  }

  function trainOne(weakPoint: WeakPoint) {
    setErrorMsg(null);
    startTransition(async () => {
      try {
        await startTopicsQuizAndRedirect({
          topics: [
            {
              discipline: weakPoint.discipline,
              subtopic: weakPoint.topic,
            },
          ],
          mode: 'aleatorio',
        });
      } catch (err) {
        setErrorMsg(
          err instanceof Error ? err.message : 'Falha ao iniciar quiz.',
        );
        // fallback navigational route
        router.push(
          `/quiz?discipline=${weakPoint.discipline}&subtopic=${encodeURIComponent(weakPoint.topic)}`,
        );
      }
    });
  }

  // Banner copy
  let bannerKind: 'no-data' | 'no-gaps' | 'gaps' = 'no-data';
  if (weak.length > 0) bannerKind = 'gaps';
  else if (totalAttemptsConsidered > 0) bannerKind = 'no-gaps';

  // Group undiagnosed by discipline
  const undiagnosedByDiscipline = new Map<Discipline, UndiagnosedTopic[]>();
  for (const u of undiagnosed) {
    const list = undiagnosedByDiscipline.get(u.discipline) ?? [];
    list.push(u);
    undiagnosedByDiscipline.set(u.discipline, list);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Banner */}
      <Card
        className="flex flex-col gap-3 border-l-4 p-4"
        style={{
          borderLeftColor:
            bannerKind === 'gaps'
              ? 'var(--accent-quiz, hsl(0 80% 60%))'
              : bannerKind === 'no-gaps'
                ? 'hsl(140 60% 45%)'
                : 'var(--muted-foreground, gray)',
        }}
      >
        {bannerKind === 'gaps' && (
          <>
            <div className="flex items-start gap-3">
              <Target
                className="mt-0.5 h-5 w-5 shrink-0 text-rose-500"
                aria-hidden
              />
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-foreground">
                  {weak.length}{' '}
                  {weak.length === 1
                    ? 'tópico onde você está perdendo nota'
                    : 'tópicos onde você está perdendo nota'}
                  .
                </p>
                <p className="text-xs text-muted-foreground">
                  Os 3 primeiros aparecem mais nas provas E você erra mais.
                  Treinar esses primeiro maximiza ganho.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={trainAll}
              disabled={submitting}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 self-start rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Target className="h-4 w-4" aria-hidden />
              {submitting
                ? 'Iniciando…'
                : `Treinar TODOS os ${weak.length} pontos fracos`}
            </button>
            {errorMsg ? (
              <p className="text-xs text-rose-500" role="alert">
                {errorMsg}
              </p>
            ) : null}
          </>
        )}
        {bannerKind === 'no-gaps' && (
          <div className="flex items-start gap-3">
            <Flame
              className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500"
              aria-hidden
            />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-foreground">
                Boa! Não detectamos pontos fracos significativos no momento.
              </p>
              <p className="text-xs text-muted-foreground">
                Continue assim. Resolva mais questões pra refinar a análise.
              </p>
            </div>
          </div>
        )}
        {bannerKind === 'no-data' && (
          <div className="flex items-start gap-3">
            <Target
              className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-foreground">
                Você ainda não tem dados suficientes pra mostrar pontos fracos.
              </p>
              <p className="text-xs text-muted-foreground">
                Resolva mais 30 questões pra começar a ver gaps reais.
              </p>
              <Link
                href="/quiz"
                className="mt-2 inline-flex min-h-[44px] items-center justify-center self-start rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
              >
                Começar quiz
              </Link>
            </div>
          </div>
        )}
      </Card>

      {/* Lista de weak points */}
      {weak.length > 0 && (
        <section
          aria-labelledby="weak-list"
          className="flex flex-col gap-3"
        >
          <h3 id="weak-list" className="sr-only">
            Lista de pontos fracos
          </h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {weak.map((w, idx) => (
              <WeakPointCard
                key={`${w.discipline}-${w.topic}`}
                weakPoint={w}
                rank={idx + 1}
                onTrain={() => trainOne(w)}
                disabled={submitting}
              />
            ))}
          </div>
        </section>
      )}

      {/* Não diagnosticados */}
      {undiagnosed.length > 0 && (
        <section className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setShowUndiagnosed((v) => !v)}
            className="flex min-h-[44px] items-center justify-between rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
            aria-expanded={showUndiagnosed}
          >
            <span>Ainda não diagnosticado ({undiagnosed.length})</span>
            {showUndiagnosed ? (
              <ChevronUp className="h-4 w-4" aria-hidden />
            ) : (
              <ChevronDown className="h-4 w-4" aria-hidden />
            )}
          </button>
          {showUndiagnosed && (
            <Card className="flex flex-col gap-3 p-4">
              <p className="text-xs text-muted-foreground">
                Resolva pelo menos 3 questões de cada um pra começar a aparecer
                aqui.
              </p>
              <div className="flex flex-col gap-3">
                {[...undiagnosedByDiscipline.entries()].map(
                  ([discipline, list]) => {
                    const accent = ACCENT_VARS[discipline];
                    return (
                      <div key={discipline} className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            aria-hidden
                            className="inline-block h-2 w-2 rounded-full"
                            style={{ backgroundColor: `var(${accent})` }}
                          />
                          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {DISCIPLINE_LABEL[discipline]}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {list.map((u) => (
                            <Link
                              key={`${u.discipline}-${u.topic}`}
                              href={`/quiz?discipline=${u.discipline}&subtopic=${encodeURIComponent(u.topic)}`}
                              className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-xs text-foreground hover:bg-muted"
                            >
                              <span>{u.topicShort}</span>
                              <span className="text-muted-foreground">
                                · {u.globalFrequency}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </Card>
          )}
        </section>
      )}
    </div>
  );
}

interface CardProps {
  weakPoint: WeakPoint;
  rank: number;
  onTrain: () => void;
  disabled: boolean;
}

function WeakPointCard({ weakPoint, rank, onTrain, disabled }: CardProps) {
  const accent = ACCENT_VARS[weakPoint.discipline];
  const isTop3 = rank <= 3;
  const accuracyTone = accuracyClass(weakPoint.accuracyPct);
  const errorPct = 100 - weakPoint.accuracyPct;

  return (
    <Card
      className="flex flex-col gap-3 border-l-4 p-4"
      style={{ borderLeftColor: `var(${accent})` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs tabular-nums text-muted-foreground">
              #{rank}
            </span>
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
              style={{
                backgroundColor: `color-mix(in oklab, var(${accent}) 18%, transparent)`,
                color: `var(${accent})`,
              }}
            >
              {DISCIPLINE_LABEL[weakPoint.discipline]}
            </span>
            {isTop3 ? (
              <span
                aria-label="Alta prioridade"
                title="Top-3 prioridade — alta frequência E alto erro"
                className="inline-flex items-center"
              >
                <Flame
                  className="h-3.5 w-3.5 text-rose-500"
                  aria-hidden
                />
              </span>
            ) : null}
          </div>
          <h4 className="text-base font-semibold text-foreground">
            {weakPoint.topicShort}
          </h4>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="flex flex-col gap-0.5">
          <span className="text-muted-foreground">Seu acerto</span>
          <span className={`text-lg font-semibold tabular-nums ${accuracyTone}`}>
            {weakPoint.accuracyPct}%
          </span>
          <span className="text-[11px] text-muted-foreground">
            {weakPoint.correct}/{weakPoint.attempts} respondidas
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-muted-foreground">Cobrança</span>
          <span className="text-lg font-semibold tabular-nums text-foreground">
            {weakPoint.globalFrequency}
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              questões
            </span>
          </span>
          <span className="text-[11px] text-muted-foreground">
            {weakPoint.globalFrequencyPct}% da disciplina
          </span>
        </div>
      </div>

      {/* Mini-barra dupla: erro (cinza) vs frequência (cor disciplina) */}
      <div className="flex flex-col gap-1.5" aria-hidden>
        <div className="flex items-center gap-2">
          <span className="w-12 text-[10px] uppercase tracking-wide text-muted-foreground">
            Erro
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-rose-400/70 dark:bg-rose-400/60"
              style={{ width: `${errorPct}%` }}
            />
          </div>
          <span className="w-10 text-right text-[10px] tabular-nums text-muted-foreground">
            {errorPct}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-12 text-[10px] uppercase tracking-wide text-muted-foreground">
            Cai
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full"
              style={{
                width: `${Math.min(100, weakPoint.globalFrequencyPct)}%`,
                backgroundColor: `var(${accent})`,
              }}
            />
          </div>
          <span className="w-10 text-right text-[10px] tabular-nums text-muted-foreground">
            {weakPoint.globalFrequencyPct}%
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onTrain}
        disabled={disabled}
        className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
      >
        Treinar este tópico
      </button>
    </Card>
  );
}
