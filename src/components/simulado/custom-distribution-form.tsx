'use client';

import { useMemo, useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { Play } from 'lucide-react';
import {
  checkSimuladoCapAction,
  startCustomDistributionSimuladoAndRedirect,
} from '@/app/simulado/actions';
import { PaywallModal } from '@/components/paywall-modal';
import { isStripeEnabledClient } from '@/lib/billing/stripe-client';

type Discipline =
  | 'matematica'
  | 'fisica'
  | 'quimica'
  | 'biologia'
  | 'humanas'
  | 'linguagens';

const DISCIPLINES: Array<{ value: Discipline; label: string; accentVar: string }> = [
  { value: 'matematica', label: 'Matemática', accentVar: '--accent-quiz' },
  { value: 'fisica', label: 'Física', accentVar: '--accent-simulado' },
  { value: 'quimica', label: 'Química', accentVar: '--accent-trilha' },
  { value: 'biologia', label: 'Biologia', accentVar: '--accent-chat' },
  { value: 'humanas', label: 'Humanas', accentVar: '--accent-jogos' },
  { value: 'linguagens', label: 'Linguagens', accentVar: '--accent-ranking' },
];

const TIME_OPTIONS = [45, 90, 180, 240] as const;

const MIN_TOTAL = 5;
const MAX_TOTAL = 90;

export interface CustomDistributionFormProps {
  /**
   * Quantas questões existem por disciplina (não-anuladas). Vem do server pra
   * mostrar "{N} disponíveis" ao lado de cada input e validar que o user não
   * tenta pedir mais do que existe.
   */
  poolByDiscipline: Record<Discipline, number>;
}

export function CustomDistributionForm({ poolByDiscipline }: CustomDistributionFormProps) {
  const searchParams = useSearchParams();
  const previewFreeMode = searchParams?.get('preview') === 'free';

  const [counts, setCounts] = useState<Record<Discipline, number>>({
    matematica: 0,
    fisica: 0,
    quimica: 0,
    biologia: 0,
    humanas: 0,
    linguagens: 0,
  });
  const [timeMin, setTimeMin] = useState<number>(180);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const total = useMemo(
    () => Object.values(counts).reduce((acc, n) => acc + n, 0),
    [counts],
  );

  const canStart = total >= MIN_TOTAL && total <= MAX_TOTAL && !isPending;

  const update = (d: Discipline, raw: number) => {
    const pool = poolByDiscipline[d] ?? 0;
    const clamped = Math.max(0, Math.min(pool, Math.min(MAX_TOTAL, raw)));
    setCounts((prev) => ({ ...prev, [d]: clamped }));
  };

  const handleStart = () => {
    if (!canStart) return;
    setErrorMsg(null);
    const distribution = DISCIPLINES.map((d) => ({
      discipline: d.value,
      count: counts[d.value] ?? 0,
    })).filter((s) => s.count > 0);

    startTransition(async () => {
      try {
        const cap = await checkSimuladoCapAction({ previewFreeMode });
        if (!cap.allowed) {
          setPaywallOpen(true);
          return;
        }
        await startCustomDistributionSimuladoAndRedirect({
          distribution,
          time_limit_min: timeMin,
        });
      } catch (err) {
        if (err instanceof Error && err.message.includes('NEXT_REDIRECT')) return;
        setErrorMsg(err instanceof Error ? err.message : 'Falha ao iniciar simulado.');
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Escolha exatamente quantas questões de cada disciplina. Total entre{' '}
        {MIN_TOTAL} e {MAX_TOTAL} questões.
      </p>

      <ul className="flex flex-col gap-2">
        {DISCIPLINES.map((d) => {
          const pool = poolByDiscipline[d.value] ?? 0;
          const value = counts[d.value] ?? 0;
          return (
            <li
              key={d.value}
              className="flex items-center gap-3 rounded-md border border-border bg-background p-3"
            >
              <div className="flex flex-1 flex-col">
                <span
                  className="text-sm font-medium"
                  style={{ color: `hsl(var(${d.accentVar}))` }}
                >
                  {d.label}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {pool} questões disponíveis
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  aria-label={`Diminuir ${d.label}`}
                  onClick={() => update(d.value, value - 1)}
                  disabled={value <= 0}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                >
                  −
                </button>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={pool}
                  value={value}
                  onChange={(e) => {
                    const n = Number.parseInt(e.target.value, 10);
                    update(d.value, Number.isNaN(n) ? 0 : n);
                  }}
                  aria-label={`Quantidade ${d.label}`}
                  className="h-9 w-14 rounded-md border border-input bg-card px-2 text-center text-sm tabular-nums text-foreground focus-visible:border-primary focus-visible:outline-none"
                />
                <button
                  type="button"
                  aria-label={`Aumentar ${d.label}`}
                  onClick={() => update(d.value, value + 1)}
                  disabled={value >= pool || total >= MAX_TOTAL}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex items-baseline justify-between rounded-md border border-border bg-muted/30 px-3 py-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Total
        </span>
        <span
          className={
            total > MAX_TOTAL || (total > 0 && total < MIN_TOTAL)
              ? 'text-base font-semibold text-destructive tabular-nums'
              : 'text-base font-semibold text-foreground tabular-nums'
          }
        >
          {total} questões
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Tempo total
        </span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TIME_OPTIONS.map((opt) => {
            const active = timeMin === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setTimeMin(opt)}
                aria-pressed={active}
                className={
                  active
                    ? 'inline-flex min-h-[40px] items-center justify-center rounded-md border border-primary bg-primary text-sm font-semibold text-primary-foreground'
                    : 'inline-flex min-h-[40px] items-center justify-center rounded-md border border-border bg-background text-sm font-medium text-foreground hover:border-primary/50'
                }
              >
                {opt} min
              </button>
            );
          })}
        </div>
      </div>

      {errorMsg ? (
        <p className="text-sm text-destructive" role="alert">
          {errorMsg}
        </p>
      ) : null}

      <button
        type="button"
        onClick={handleStart}
        disabled={!canStart}
        className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Play className="h-4 w-4" aria-hidden="true" />
        {isPending ? 'Iniciando…' : `Iniciar simulado (${total}q em ${timeMin}min)`}
      </button>

      {total > 0 && total < MIN_TOTAL ? (
        <p className="text-[11px] italic text-muted-foreground">
          Mínimo de {MIN_TOTAL} questões pra iniciar.
        </p>
      ) : null}

      <PaywallModal
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        reason="simulado"
        fallback={!isStripeEnabledClient()}
      />
    </div>
  );
}
