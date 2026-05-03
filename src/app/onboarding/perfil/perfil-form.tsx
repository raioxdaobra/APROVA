'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { UsernameField, type UsernameState } from '@/components/username-field';
import { track } from '@/lib/analytics';
import { submitProfile, type ProfileState } from './actions';

const initialState: ProfileState = {};

export function PerfilForm() {
  const [state, formAction] = useFormState(submitProfile, initialState);
  const [usernameState, setUsernameState] = useState<UsernameState>('idle');
  const router = useRouter();

  const handleStateChange = useCallback((next: UsernameState) => {
    setUsernameState(next);
  }, []);

  useEffect(() => {
    if (state.ok) {
      track('signup_completed', { provider: 'email' });
      track('onboarding_step_completed', { step: 1 });
      router.push('/onboarding/meta');
    }
  }, [state.ok, router]);

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <UsernameField onStateChange={handleStateChange} />

      {state.fieldErrors?.username && (
        <span role="alert" className="text-xs text-error">
          {state.fieldErrors.username}
        </span>
      )}

      {state.error && (
        <p
          role="alert"
          className="rounded border border-error bg-error-bg p-3 text-sm text-error-foreground"
        >
          {state.error}
        </p>
      )}

      <SubmitButton disabled={usernameState !== 'available'} />
    </form>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending || disabled} className="mt-2 w-full">
      {pending ? 'Salvando...' : 'Continuar'}
    </Button>
  );
}
