'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { startSimulado, checkSimuladoCapAction } from '@/app/simulado/actions';
import { PaywallModal } from '@/components/paywall-modal';
import { isStripeEnabledClient } from '@/lib/billing/stripe-client';
import {
  SIMULADO_TOTAL_OPTIONS,
  SIMULADO_TIME_OPTIONS,
  SIMULADO_DISCIPLINE_OPTIONS,
  SIMULADO_DEFAULT_TOTAL,
  SIMULADO_DEFAULT_TIME,
  SIMULADO_DEFAULT_DISCIPLINE,
  type SimuladoTotalOption,
  type SimuladoTimeOption,
  type SimuladoDisciplineOption,
  disciplineLabel,
} from '@/app/simulado/config';

const DISCIPLINE_LABELS: Record<SimuladoDisciplineOption, string> = {
  todas: 'Todas',
  matematica: disciplineLabel('matematica'),
  fisica: disciplineLabel('fisica'),
  quimica: disciplineLabel('quimica'),
  biologia: disciplineLabel('biologia'),
  humanas: disciplineLabel('humanas'),
  linguagens: disciplineLabel('linguagens'),
};

export function SimuladoSetupForm() {
  const [total, setTotal] = useState<SimuladoTotalOption>(SIMULADO_DEFAULT_TOTAL);
  const [timeMin, setTimeMin] = useState<SimuladoTimeOption>(SIMULADO_DEFAULT_TIME);
  const [discipline, setDiscipline] = useState<SimuladoDisciplineOption>(
    SIMULADO_DEFAULT_DISCIPLINE,
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [paywallOpen, setPaywallOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    startTransition(async () => {
      try {
        const cap = await checkSimuladoCapAction();
        if (!cap.allowed) {
          setPaywallOpen(true);
          return;
        }
        await startSimulado({
          total,
          time_limit_min: timeMin,
          discipline,
        });
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : 'Falha ao iniciar simulado.';
        setErrorMsg(msg);
      }
    });
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <fieldset className="flex flex-col gap-3" disabled={isPending}>
        <legend className="text-sm font-semibold text-foreground">
          Número de questões
        </legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SIMULADO_TOTAL_OPTIONS.map((opt) => (
            <OptionCard
              key={opt}
              selected={total === opt}
              onClick={() => setTotal(opt)}
              label={String(opt)}
              suffix="questões"
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3" disabled={isPending}>
        <legend className="text-sm font-semibold text-foreground">
          Tempo total
        </legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SIMULADO_TIME_OPTIONS.map((opt) => (
            <OptionCard
              key={opt}
              selected={timeMin === opt}
              onClick={() => setTimeMin(opt)}
              label={String(opt)}
              suffix="minutos"
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          60 questões em 180 minutos é o formato oficial da prova.
        </p>
      </fieldset>

      <fieldset className="flex flex-col gap-2" disabled={isPending}>
        <label
          htmlFor="discipline-select"
          className="text-sm font-semibold text-foreground"
        >
          Disciplina
        </label>
        <select
          id="discipline-select"
          className="h-11 rounded-md border border-border bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={discipline}
          onChange={(e) => {
            const v = e.target.value as SimuladoDisciplineOption;
            if (SIMULADO_DISCIPLINE_OPTIONS.includes(v)) setDiscipline(v);
          }}
        >
          {SIMULADO_DISCIPLINE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {DISCIPLINE_LABELS[opt]}
            </option>
          ))}
        </select>
      </fieldset>

      {errorMsg ? (
        <p className="text-sm text-destructive" role="alert">
          {errorMsg}
        </p>
      ) : null}

      <p className="text-xs text-muted-foreground">
        Após começar, o cronômetro não pode ser pausado.
      </p>

      <Button type="submit" size="lg" disabled={isPending} className="w-full">
        {isPending ? 'Preparando...' : 'Começar simulado'}
      </Button>

      <PaywallModal
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        reason="simulado"
        fallback={!isStripeEnabledClient()}
      />
    </form>
  );
}

function OptionCard({
  selected,
  onClick,
  label,
  suffix,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  suffix: string;
}) {
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-pressed={selected}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center gap-1 p-4 text-center transition-colors duration-motion-base',
        selected
          ? 'border-primary bg-primary-light'
          : 'hover:border-primary/40',
      )}
    >
      <span className="text-2xl font-semibold text-foreground">{label}</span>
      <span className="text-xs text-muted-foreground">{suffix}</span>
    </Card>
  );
}
