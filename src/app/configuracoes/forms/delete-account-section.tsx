'use client';

import { useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { deleteAccount, type FieldState } from '../actions';

const initialState: FieldState = {};

export function DeleteAccountSection({ username }: { username: string }) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [state, formAction] = useFormState(deleteAccount, initialState);
  const [confirmText, setConfirmText] = useState('');

  return (
    <div className="flex flex-col gap-2 border-t border-border pt-4">
      <span className="text-sm font-semibold text-foreground">Apagar minha conta</span>
      <p className="text-xs text-muted-foreground">
        Remove perfil, histórico, sequências e XP. Esta ação é permanente.
      </p>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        className="self-start"
        onClick={() => dialogRef.current?.showModal()}
      >
        Apagar minha conta
      </Button>

      <dialog
        ref={dialogRef}
        className="m-auto w-full max-w-sm rounded-lg border border-border bg-card p-6 text-foreground shadow-lg backdrop:bg-foreground/40"
      >
        <form action={formAction} className="flex flex-col gap-3" noValidate>
          <h2 className="text-lg font-semibold">Tem certeza?</h2>
          <p className="text-sm text-muted-foreground">
            Tudo será apagado em definitivo. Para confirmar, digite seu username{' '}
            <span className="font-mono font-semibold text-foreground">@{username}</span>:
          </p>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="del-confirm">Confirme seu username</Label>
            <Input
              id="del-confirm"
              name="confirm_username"
              type="text"
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={confirmText}
              onChange={(e) => setConfirmText(e.currentTarget.value)}
              aria-invalid={state.fieldErrors?.confirm_username ? true : undefined}
            />
            {state.fieldErrors?.confirm_username && (
              <span role="alert" className="text-xs text-error">
                {state.fieldErrors.confirm_username}
              </span>
            )}
          </div>
          {state.error && (
            <p role="alert" className="rounded border border-error bg-error-bg p-2 text-xs text-error-foreground">
              {state.error}
            </p>
          )}
          <div className="mt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => dialogRef.current?.close()}
            >
              Cancelar
            </Button>
            <ConfirmDeleteButton disabled={confirmText.trim() !== username} />
          </div>
        </form>
      </dialog>
    </div>
  );
}

function ConfirmDeleteButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="destructive" size="sm" disabled={pending || disabled}>
      {pending ? 'Apagando...' : 'Apagar permanentemente'}
    </Button>
  );
}
