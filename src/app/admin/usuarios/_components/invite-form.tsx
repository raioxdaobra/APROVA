'use client';

import { useActionState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { inviteUser } from '../actions';

const initialState: { error?: string; ok?: boolean } | null = null;

export function InviteForm() {
  const [state, formAction, pending] = useActionState(inviteUser, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <div className="flex flex-1 flex-col gap-1">
        <label htmlFor="invite-email" className="text-xs font-semibold text-foreground">
          Convidar usuário por email
        </label>
        <input
          id="invite-email"
          name="email"
          type="email"
          required
          placeholder="aluno@gmail.com"
          className="h-10 rounded-md border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? 'Enviando…' : 'Enviar convite'}
      </Button>
      {state?.error ? (
        <p role="alert" className="text-xs text-destructive sm:ml-3">
          {state.error}
        </p>
      ) : null}
      {state?.ok ? (
        <p role="status" className="text-xs text-success sm:ml-3">
          Convite enviado!
        </p>
      ) : null}
    </form>
  );
}
