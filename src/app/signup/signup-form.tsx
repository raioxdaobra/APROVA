'use client';

import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Loader2, Lock, Mail, User } from 'lucide-react';
import { AuthInput } from '@/components/auth/auth-input';
import { AuthCtaButton } from '@/components/auth/auth-cta-button';
import { track } from '@/lib/analytics';
import { signUpWithEmail, type SignUpState } from './actions';

const initialState: SignUpState = {};

export function SignUpForm() {
  const [state, formAction] = useFormState(signUpWithEmail, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <AuthInput
        id="display_name"
        name="display_name"
        type="text"
        label="Como devemos te chamar?"
        autoComplete="name"
        placeholder="Seu primeiro nome"
        maxLength={60}
        required
        icon={<User className="h-4 w-4" />}
        error={state.fieldErrors?.display_name}
      />
      <AuthInput
        id="email"
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        placeholder="seu@email.com"
        required
        icon={<Mail className="h-4 w-4" />}
        error={state.fieldErrors?.email}
      />
      <AuthInput
        id="password"
        name="password"
        type="password"
        label="Senha (mínimo 8 caracteres)"
        autoComplete="new-password"
        placeholder="Mínimo 8 caracteres"
        minLength={8}
        required
        icon={<Lock className="h-4 w-4" />}
        error={state.fieldErrors?.password}
      />

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

  useEffect(() => {
    if (pending) track('signup_started', { provider: 'email' });
  }, [pending]);

  return (
    <AuthCtaButton
      type="submit"
      disabled={pending}
      rightIcon={pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
    >
      {pending ? 'Criando conta...' : 'Criar minha conta'}
    </AuthCtaButton>
  );
}
