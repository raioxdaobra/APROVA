'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateDisplayName, type FieldState } from '../actions';

const initialState: FieldState = {};

export function DisplayNameForm({ initial }: { initial: string }) {
  const [state, formAction] = useFormState(updateDisplayName, initialState);
  const fieldErr = state.fieldErrors?.display_name;
  return (
    <form action={formAction} className="flex flex-col gap-2" noValidate>
      <Label htmlFor="cfg-display-name">Nome de exibição</Label>
      <Input
        id="cfg-display-name"
        name="display_name"
        type="text"
        defaultValue={initial}
        minLength={2}
        maxLength={40}
        aria-invalid={fieldErr ? true : undefined}
        aria-describedby="cfg-display-name-msg"
      />
      <FormFeedback id="cfg-display-name-msg" state={state} fieldKey="display_name" />
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" variant="secondary" disabled={pending} className="self-start">
      {pending ? 'Salvando...' : 'Salvar'}
    </Button>
  );
}

function FormFeedback({
  id,
  state,
  fieldKey,
}: {
  id: string;
  state: FieldState;
  fieldKey: string;
}) {
  const fieldErr = state.fieldErrors?.[fieldKey];
  if (fieldErr) {
    return (
      <span id={id} role="alert" className="text-xs text-error">
        {fieldErr}
      </span>
    );
  }
  if (state.error) {
    return (
      <span id={id} role="alert" className="text-xs text-error">
        {state.error}
      </span>
    );
  }
  if (state.ok) {
    return (
      <span id={id} role="status" className="text-xs text-success">
        Salvo.
      </span>
    );
  }
  return <span id={id} className="hidden" aria-hidden="true" />;
}
