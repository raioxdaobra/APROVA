'use client';

import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { Loader2, Mail } from 'lucide-react';
import { AuthInput } from '@/components/auth/auth-input';
import { AuthCtaButton } from '@/components/auth/auth-cta-button';
import { requestPasswordReset, type ForgotPasswordState } from './actions';

const initialState: ForgotPasswordState = {};

export function ForgotPasswordForm() {
  const [state, formAction] = useFormState(requestPasswordReset, initialState);

  return (
    <>
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
          error={state.fieldErrors?.email}
          aria-invalid={state.fieldErrors?.email ? true : undefined}
        />

        {state.error && (
          <p
            id="forgot-error"
            role="alert"
            className="rounded border border-error bg-error-bg p-3 text-sm text-error-foreground"
          >
            {state.error}
          </p>
        )}

        {state.success && (
          <p
            id="forgot-success"
            role="status"
            className="rounded border border-primary/40 bg-primary/10 p-3 text-sm text-foreground"
          >
            {state.success}
          </p>
        )}

        <SubmitButton />
      </form>

      <div className="mt-6 flex flex-col items-center gap-2 text-sm">
        <Link
          href="/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Voltar para o login
        </Link>
      </div>
    </>
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
      {pending ? 'Enviando...' : 'Enviar link de recuperação'}
    </AuthCtaButton>
  );
}
