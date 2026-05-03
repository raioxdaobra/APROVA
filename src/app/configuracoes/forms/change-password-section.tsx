'use client';

import { useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updatePassword, type FieldState } from '../actions';

const initialState: FieldState = {};

export function ChangePasswordSection() {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [state, formAction] = useFormState(updatePassword, initialState);

  useEffect(() => {
    if (state.ok && dialogRef.current?.open) {
      dialogRef.current.close();
    }
  }, [state.ok]);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-foreground">Senha</span>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="self-start"
        onClick={() => dialogRef.current?.showModal()}
      >
        Alterar senha
      </Button>
      {state.ok && !state.error && !state.fieldErrors && (
        <span role="status" className="text-xs text-success">
          Senha atualizada.
        </span>
      )}
      <dialog
        ref={dialogRef}
        className="m-auto w-full max-w-sm rounded-lg border border-border bg-card p-6 text-foreground shadow-lg backdrop:bg-foreground/40"
        onClose={() => {
          /* noop */
        }}
      >
        <form action={formAction} className="flex flex-col gap-3" noValidate>
          <h2 className="text-lg font-semibold">Alterar senha</h2>
          <p className="text-xs text-muted-foreground">
            Confirme a senha atual e escolha uma nova com pelo menos 8 caracteres.
          </p>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pwd-current">Senha atual</Label>
            <Input
              id="pwd-current"
              name="current_password"
              type="password"
              autoComplete="current-password"
              required
              aria-invalid={state.fieldErrors?.current_password ? true : undefined}
            />
            {state.fieldErrors?.current_password && (
              <span role="alert" className="text-xs text-error">
                {state.fieldErrors.current_password}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pwd-new">Nova senha</Label>
            <Input
              id="pwd-new"
              name="new_password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              aria-invalid={state.fieldErrors?.new_password ? true : undefined}
            />
            {state.fieldErrors?.new_password && (
              <span role="alert" className="text-xs text-error">
                {state.fieldErrors.new_password}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pwd-confirm">Confirme a nova senha</Label>
            <Input
              id="pwd-confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              required
              aria-invalid={state.fieldErrors?.confirm ? true : undefined}
            />
            {state.fieldErrors?.confirm && (
              <span role="alert" className="text-xs text-error">
                {state.fieldErrors.confirm}
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
            <ConfirmButton />
          </div>
        </form>
      </dialog>
    </div>
  );
}

function ConfirmButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? 'Salvando...' : 'Salvar nova senha'}
    </Button>
  );
}
