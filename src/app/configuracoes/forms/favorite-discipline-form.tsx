'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { Discipline } from '@/lib/supabase/types';
import { updateFavoriteDiscipline, type FieldState } from '../actions';

type Option = { value: '' | Discipline; label: string };

const OPTIONS: Option[] = [
  { value: '', label: 'Nenhuma' },
  { value: 'matematica', label: 'Matemática' },
  { value: 'fisica', label: 'Física' },
  { value: 'quimica', label: 'Química' },
  { value: 'biologia', label: 'Biologia' },
  { value: 'humanas', label: 'Humanas' },
  { value: 'linguagens', label: 'Linguagens' },
];

const initialState: FieldState = {};

export function FavoriteDisciplineForm({ initial }: { initial: Discipline | null }) {
  const [state, formAction] = useFormState(updateFavoriteDiscipline, initialState);
  const [value, setValue] = useState<'' | Discipline>(initial ?? '');
  const dirty = (initial ?? '') !== value;

  return (
    <form action={formAction} className="flex flex-col gap-2" noValidate>
      <Label htmlFor="cfg-fav">Disciplina favorita (opcional)</Label>
      <select
        id="cfg-fav"
        name="favorite_discipline"
        value={value}
        onChange={(e) => setValue(e.currentTarget.value as '' | Discipline)}
        className={cn(
          'h-11 w-full rounded border border-input bg-card px-3 text-base text-foreground transition-colors focus-visible:border-primary focus-visible:outline-none',
        )}
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {state.error && (
        <span role="alert" className="text-xs text-error">
          {state.error}
        </span>
      )}
      {state.ok && (
        <span role="status" className="text-xs text-success">
          Salvo.
        </span>
      )}
      <SubmitButton disabled={!dirty} />
    </form>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="sm"
      variant="secondary"
      disabled={pending || disabled}
      className="self-start"
    >
      {pending ? 'Salvando...' : 'Salvar'}
    </Button>
  );
}
