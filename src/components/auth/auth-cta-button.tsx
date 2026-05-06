'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Botão primário de submit das telas de auth.
 *
 * - Altura 12, full-width, gradient laranja com hover scale sutil.
 * - Ícone opcional à direita (ex: Loader2 girando enquanto pendente).
 * - Mantém comportamento nativo de `<button type="submit">`.
 */
export interface AuthCtaButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  rightIcon?: React.ReactNode;
}

export const AuthCtaButton = React.forwardRef<HTMLButtonElement, AuthCtaButtonProps>(
  function AuthCtaButton(
    { className, children, rightIcon, disabled, ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'inline-flex h-12 w-full items-center justify-center gap-2 rounded',
          'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground',
          'text-base font-semibold tracking-tight',
          'shadow-[0_8px_24px_-12px_rgba(196,99,59,0.6)]',
          'transition-all duration-200',
          'hover:scale-[1.01] hover:shadow-[0_10px_28px_-10px_rgba(196,99,59,0.75)]',
          'disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100',
          'focus-visible:outline-none',
          className,
        )}
        {...rest}
      >
        <span>{children}</span>
        {rightIcon ? <span aria-hidden="true">{rightIcon}</span> : null}
      </button>
    );
  },
);
