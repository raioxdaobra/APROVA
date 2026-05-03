'use client';

import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { track } from '@/lib/analytics';
import { signUpWithEmail, type SignUpState } from './actions';

const initialState: SignUpState = {};

export function SignUpForm() {
  const [state, formAction] = useFormState(signUpWithEmail, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <Field
        id="display_name"
        name="display_name"
        type="text"
        label="Como devemos te chamar?"
        autoComplete="name"
        maxLength={60}
        required
        error={state.fieldErrors?.display_name}
      />
      <Field
        id="email"
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        required
        error={state.fieldErrors?.email}
      />
      <Field
        id="password"
        name="password"
        type="password"
        label="Senha (mínimo 8 caracteres)"
        autoComplete="new-password"
        minLength={8}
        required
        error={state.fieldErrors?.password}
      />

      {state.error && (
        <p role="alert" className="rounded border border-error bg-error-bg p-3 text-sm text-error-foreground">
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}

function Field({
  id,
  name,
  type,
  label,
  error,
  autoComplete,
  required,
  minLength,
  maxLength,
}: {
  id: string;
  name: string;
  type: 'text' | 'email' | 'password';
  label: string;
  error?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
}) {
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <span id={errorId} className="text-xs text-error">
          {error}
        </span>
      )}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  useEffect(() => {
    if (pending) track('signup_started', { provider: 'email' });
  }, [pending]);

  return (
    <Button type="submit" size="lg" disabled={pending} className="mt-2 w-full">
      {pending ? 'Criando conta...' : 'Criar conta'}
    </Button>
  );
}
