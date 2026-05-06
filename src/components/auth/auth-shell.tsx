import Link from 'next/link';
import type { ReactNode } from 'react';
import { AuroraBackground } from '@/components/landing/aurora-background';
import { LogoIcon } from '@/components/logo-icon';

/**
 * Wrapper compartilhado por /login e /signup.
 *
 * - Aurora background sutil (sem grid, animação lenta) coerente com a landing.
 * - Card semi-transparente com glow do primary, max-w-md em desktop.
 * - Logo APROVA no topo, ligando para a home.
 * - Footer opcional pra copy de credibilidade.
 *
 * Server Component — não usa estado nem JS no cliente.
 */
export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="relative isolate min-h-screen overflow-hidden">
      <AuroraBackground
        className="-z-10 opacity-[0.10] dark:opacity-[0.18]"
        noGrid
        slow
      />

      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10 sm:px-6">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded transition-transform hover:scale-[1.02] focus-visible:outline-none"
            aria-label="APROVA — Voltar para a home"
          >
            <LogoIcon size={48} variant="full" ariaLabel="" />
            <span className="text-2xl font-semibold tracking-tight text-foreground">
              APROVA
            </span>
          </Link>
        </div>

        <div
          className={[
            'rounded-lg border border-border/50 bg-card/95 p-8 backdrop-blur-md md:p-10',
            'shadow-[0_0_60px_-15px_rgba(196,99,59,0.4)]',
          ].join(' ')}
        >
          <div className="mb-6 flex flex-col gap-1.5">
            <h1 className="text-2xl font-semibold leading-tight tracking-tight text-foreground">
              {title}
            </h1>
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>

          {children}
        </div>

        {footer ? (
          <div className="mt-6 text-center text-xs text-muted-foreground">
            {footer}
          </div>
        ) : null}
      </div>
    </main>
  );
}
