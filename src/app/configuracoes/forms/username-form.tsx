'use client';

import { useEffect, useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { updateUsername, type FieldState } from '../actions';

type CheckState = 'idle' | 'checking' | 'available' | 'taken' | 'invalid' | 'too_short';

const USERNAME_REGEX = /^[a-z0-9_]+$/;
const initialState: FieldState = {};

function localValidate(value: string): CheckState | null {
  if (value.length === 0) return 'idle';
  if (value.length < 3) return 'too_short';
  if (value.length > 20 || !USERNAME_REGEX.test(value)) return 'invalid';
  return null;
}

function stateMessage(state: CheckState): string {
  switch (state) {
    case 'checking':
      return 'Verificando disponibilidade...';
    case 'available':
      return 'Disponível.';
    case 'taken':
      return 'Esse username já foi escolhido.';
    case 'invalid':
      return 'Use só letras minúsculas, números e _ (3-20 caracteres).';
    case 'too_short':
      return 'Mínimo 3 caracteres.';
    case 'idle':
    default:
      return 'Letras minúsculas, números ou _.';
  }
}

export function UsernameForm({ initial }: { initial: string }) {
  const [state, formAction] = useFormState(updateUsername, initialState);
  const [value, setValue] = useState(initial);
  const [check, setCheck] = useState<CheckState>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();

    if (value === initial) {
      setCheck('idle');
      return;
    }
    const local = localValidate(value);
    if (local) {
      setCheck(local);
      return;
    }
    setCheck('checking');
    debounceRef.current = setTimeout(() => {
      const controller = new AbortController();
      abortRef.current = controller;
      fetch(`/api/username-available?u=${encodeURIComponent(value)}`, {
        signal: controller.signal,
      })
        .then(async (res) => {
          if (!res.ok) {
            setCheck('invalid');
            return;
          }
          const json = (await res.json()) as { available: boolean; reason?: string };
          if (json.available) setCheck('available');
          else if (json.reason === 'taken') setCheck('taken');
          else if (json.reason === 'too_short') setCheck('too_short');
          else setCheck('invalid');
        })
        .catch((err: unknown) => {
          if (err instanceof DOMException && err.name === 'AbortError') return;
          setCheck('invalid');
        });
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, initial]);

  const borderClass = (() => {
    switch (check) {
      case 'checking':
        return 'border-warning';
      case 'available':
        return 'border-success';
      case 'taken':
      case 'invalid':
      case 'too_short':
        return 'border-destructive';
      default:
        return 'border-border';
    }
  })();

  const fieldErr = state.fieldErrors?.username;
  const canSubmit =
    value !== initial && (check === 'available' || (check === 'idle' && value === initial));

  return (
    <form action={formAction} className="flex flex-col gap-2" noValidate>
      <Label htmlFor="cfg-username">Username</Label>
      <Input
        id="cfg-username"
        name="username"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value.toLowerCase())}
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        minLength={3}
        maxLength={20}
        aria-describedby="cfg-username-msg"
        aria-invalid={
          fieldErr || check === 'taken' || check === 'invalid' || check === 'too_short'
            ? true
            : undefined
        }
        className={cn(borderClass)}
      />
      <span
        id="cfg-username-msg"
        role={check === 'taken' || check === 'invalid' || check === 'too_short' ? 'alert' : 'status'}
        aria-live="polite"
        className={cn(
          'text-xs',
          check === 'available' && 'text-success',
          (check === 'taken' || check === 'invalid' || check === 'too_short') && 'text-error',
          (check === 'idle' || check === 'checking') && 'text-muted-foreground',
        )}
      >
        {fieldErr ?? state.error ?? (state.ok ? 'Salvo.' : stateMessage(check))}
      </span>
      <SubmitButton disabled={!canSubmit} />
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
