'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export type UsernameState = 'idle' | 'checking' | 'available' | 'taken' | 'invalid' | 'too_short';

interface UsernameFieldProps {
  name?: string;
  defaultValue?: string;
  onStateChange?: (state: UsernameState, value: string) => void;
}

const USERNAME_REGEX = /^[a-z0-9_]+$/;

function localValidate(value: string): UsernameState | null {
  if (value.length === 0) return 'idle';
  if (value.length < 3) return 'too_short';
  if (value.length > 20 || !USERNAME_REGEX.test(value)) return 'invalid';
  return null;
}

function stateMessage(state: UsernameState): string {
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

export function UsernameField({
  name = 'username',
  defaultValue = '',
  onStateChange,
}: UsernameFieldProps) {
  const fieldId = useId();
  const statusId = `${fieldId}-status`;
  const [value, setValue] = useState(defaultValue);
  const [state, setState] = useState<UsernameState>(defaultValue ? 'checking' : 'idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    onStateChange?.(state, value);
  }, [state, value, onStateChange]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();

    const local = localValidate(value);
    if (local) {
      setState(local);
      return;
    }

    setState('checking');
    debounceRef.current = setTimeout(() => {
      const controller = new AbortController();
      abortRef.current = controller;
      fetch(`/api/username-available?u=${encodeURIComponent(value)}`, {
        signal: controller.signal,
      })
        .then(async (res) => {
          if (!res.ok) {
            setState('invalid');
            return;
          }
          const json = (await res.json()) as { available: boolean; reason?: string };
          if (json.available) {
            setState('available');
          } else if (json.reason === 'taken') {
            setState('taken');
          } else if (json.reason === 'too_short') {
            setState('too_short');
          } else {
            setState('invalid');
          }
        })
        .catch((err: unknown) => {
          if (err instanceof DOMException && err.name === 'AbortError') return;
          setState('invalid');
        });
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  const borderClass = (() => {
    switch (state) {
      case 'checking':
        return 'border-warning';
      case 'available':
        return 'border-success';
      case 'taken':
      case 'invalid':
      case 'too_short':
        return 'border-destructive';
      case 'idle':
      default:
        return 'border-border';
    }
  })();

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={fieldId}>Username</Label>
      <Input
        id={fieldId}
        name={name}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value.toLowerCase())}
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        minLength={3}
        maxLength={20}
        required
        aria-describedby={statusId}
        aria-invalid={
          state === 'taken' || state === 'invalid' || state === 'too_short' ? true : undefined
        }
        className={cn(borderClass)}
      />
      <span
        id={statusId}
        role="status"
        aria-live="polite"
        className={cn(
          'text-xs',
          state === 'available' && 'text-success',
          (state === 'taken' || state === 'invalid' || state === 'too_short') && 'text-error',
          (state === 'idle' || state === 'checking') && 'text-muted-foreground',
        )}
      >
        {stateMessage(state)}
      </span>
      <input type="hidden" name="username_state" value={state} readOnly />
    </div>
  );
}
