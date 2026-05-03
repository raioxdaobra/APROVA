'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { updateDailyGoal, type FieldState } from '../actions';

const initialState: FieldState = {};

export function DailyGoalForm({ initial }: { initial: number }) {
  const [state, formAction] = useFormState(updateDailyGoal, initialState);
  const [value, setValue] = useState<number>(initial);

  return (
    <form action={formAction} className="flex flex-col gap-2" noValidate>
      <Label htmlFor="cfg-daily-goal">
        Meta diária:{' '}
        <span className="font-mono text-base text-foreground">
          {value} {value === 1 ? 'questão' : 'questões'}
        </span>
      </Label>
      <input
        id="cfg-daily-goal"
        name="daily_goal"
        type="range"
        min={5}
        max={100}
        step={5}
        value={value}
        onChange={(e) => setValue(Number(e.currentTarget.value))}
        className="w-full accent-primary"
      />
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>5</span>
        <span>50</span>
        <span>100</span>
      </div>
      <Feedback state={state} />
      <SubmitButton disabled={value === initial} />
    </form>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="sm"
      variant="secondary"
      disabled={pending || disabled}
      className="self-start"
    >
      {pending ? 'Salvando...' : 'Salvar'}
    </Button>
  );
}

function Feedback({ state }: { state: FieldState }) {
  if (state.error) {
    return (
      <span role="alert" className="text-xs text-error">
        {state.error}
      </span>
    );
  }
  if (state.ok) {
    return (
      <span role="status" className="text-xs text-success">
        Salvo.
      </span>
    );
  }
  return null;
}
