import * as React from 'react';
import { Input, type InputProps } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/**
 * Input com label, ícone à esquerda e suporte a mensagem de erro.
 * Usa o `Input` base — preserva todas as classes/comportamentos existentes,
 * só ajusta padding-left e altura pra acomodar o ícone.
 */
export interface AuthInputProps extends InputProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  error?: string;
  helperId?: string;
}

export const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  function AuthInput({ id, label, icon, error, className, helperId, ...rest }, ref) {
    const errorId = error ? `${id}-error` : undefined;
    const describedBy = errorId ?? helperId;

    return (
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={id}>{label}</Label>
        <div className="relative">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {icon}
          </span>
          <Input
            ref={ref}
            id={id}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn('h-12 pl-10', className)}
            {...rest}
          />
        </div>
        {error ? (
          <span id={errorId} className="text-xs text-error">
            {error}
          </span>
        ) : null}
      </div>
    );
  },
);
