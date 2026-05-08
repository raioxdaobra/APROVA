'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { track } from '@/lib/analytics';
import { submitPrivacy, type PrivacyState } from './actions';

const initialState: PrivacyState = {};

export function PrivacyForm() {
  const [state, formAction] = useFormState(submitPrivacy, initialState);
  const [checked, setChecked] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      track('onboarding_step_completed', { step: 3 });
      router.push('/onboarding/diagnostico');
    }
  }, [state.ok, router]);

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <div className="flex items-start gap-4 rounded-lg border border-border bg-card p-4">
        <div className="flex flex-1 flex-col gap-1">
          <Label htmlFor="leaderboard" className="text-base">
            Aparecer no ranking de desempenho semanal?
          </Label>
          <p className="text-xs text-muted-foreground">
            Sempre como seu_username, nunca seu nome real. Pode mudar depois nas configurações.
          </p>
        </div>
        <Switch
          id="leaderboard"
          name="leaderboard"
          checked={checked}
          onCheckedChange={setChecked}
        />
      </div>

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
