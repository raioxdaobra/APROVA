'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Loader2, Lock, Mail } from 'lucide-react';
import { AuthInput } from '@/components/auth/auth-input';
import { AuthCtaButton } from '@/components/auth/auth-cta-button';
import { signInWithEmail, type SignInState } from './actions';

const initialState: SignInState = {};

export function LoginForm() {
  const [state, formAction] = useFormState(signInWithEmail, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <AuthInput
        id="email"
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        placeholder="seu@email.com"
        required
        icon={<Mail className="h-4 w-4" />}
        aria-invalid={state.error ? true : undefined}
      />
      <AuthInput
        id="password"
        name="password"
        type="password"
        label="Senha"
        autoComplete="current-password"
        placeholder="Sua senha"
        required
        icon={<Lock className="h-4 w-4" />}
        aria-invalid={state.error ? true : undefined}
      />

      {state.error && (
        <p
          id="login-error"
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
    <AuthCtaButton
      type="submit"
      disabled={pending}
      rightIcon={pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
    >
      {pending ? 'Entrando...' : 'Entrar no APROVA'}
    </AuthCtaButton>
  );
}
