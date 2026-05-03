'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import { submitMeta, type MetaState } from './actions';

const initialState: MetaState = {};

const OPTIONS = [
  {
    value: '10',
    title: 'Leve',
    headline: '10 questões por dia',
    description: 'Pra encaixar entre aulas e prova oral.',
  },
  {
    value: '20',
    title: 'Médio',
    headline: '20 questões por dia',
    description: 'Ritmo equilibrado pros últimos meses.',
  },
  {
    value: '40',
    title: 'Intenso',
    headline: '40 questões por dia',
    description: 'Quem quer queimar conteúdo na reta final.',
  },
] as const;

export function MetaForm() {
  const [state, formAction] = useFormState(submitMeta, initialState);
  const [selected, setSelected] = useState<string>('20');
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      track('onboarding_step_completed', { step: 2 });
      router.push('/onboarding/privacidade');
    }
  }, [state.ok, router]);

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <RadioGroup
        name="daily_goal"
        value={selected}
        onValueChange={setSelected}
        className="grid gap-3"
      >
        {OPTIONS.map((opt) => {
          const isSelected = selected === opt.value;
          const itemId = `daily-goal-${opt.value}`;
          return (
            <Label
              key={opt.value}
              htmlFor={itemId}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-lg border bg-card p-4 font-normal shadow-xs transition-colors',
                isSelected ? 'border-primary' : 'border-border hover:bg-muted',
              )}
            >
              <RadioGroupItem id={itemId} value={opt.value} />
              <div className="flex flex-1 flex-col">
                <span className="text-sm font-semibold text-foreground">{opt.title}</span>
                <span className="text-base text-foreground">{opt.headline}</span>
                <span className="text-xs text-muted-foreground">{opt.description}</span>
              </div>
            </Label>
          );
        })}
      </RadioGroup>

      {state.error && (
        <p
          role="alert"
          className="rounded border border-error bg-error-bg p-3 text-sm text-error-foreground"
        >
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="mt-2 w-full">
      {pending ? 'Salvando...' : 'Continuar'}
    </Button>
  );
}
