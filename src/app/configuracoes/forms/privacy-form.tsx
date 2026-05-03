'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { updatePrivacy, type FieldState } from '../actions';

const initialState: FieldState = {};

export function PrivacyForm({ initial }: { initial: boolean }) {
  const [state, formAction] = useFormState(updatePrivacy, initialState);
  const [checked, setChecked] = useState<boolean>(initial);
  const dirty = checked !== initial;

  return (
    <form action={formAction} className="flex flex-col gap-3" noValidate>
      <div className="flex items-start gap-4 rounded-lg border border-border bg-background p-4">
        <div className="flex flex-1 flex-col gap-1">
          <Label htmlFor="cfg-leaderboard" className="text-base">
            Aparecer no ranking semanal
          </Label>
          <p className="text-xs text-muted-foreground">
            Sempre como @username, nunca seu nome real.
          </p>
        </div>
        <Switch
          id="cfg-leaderboard"
          name="leaderboard"
          checked={checked}
          onCheckedChange={setChecked}
        />
      </div>
      {state.error && (
        <span role="alert" className="text-xs text-error">
          {state.error}
        </span>
      )}
      {state.ok && (
        <span role="status" className="text-xs text-success">
          Salvo.
        </span>
      )}
      <SubmitButton disabled={!dirty} />
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
