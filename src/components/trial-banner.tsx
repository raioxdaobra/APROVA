'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const PUBLIC_PREFIXES = new Set([
  '/',
  '/login',
  '/signup',
  '/sobre',
  '/privacidade',
  '/termos',
]);

const PUBLIC_DYNAMIC = ['/auth', '/onboarding', '/aguardando-aprovacao', '/conta-bloqueada'];

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_PREFIXES.has(pathname)) return true;
  return PUBLIC_DYNAMIC.some((p) => pathname.startsWith(p));
}

function diffDays(target: Date): number {
  const ms = target.getTime() - Date.now();
  if (ms <= 0) return 0;
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

const SESSION_KEY = 'aprova-trial-banner-dismissed';

export interface TrialBannerProps {
  /** ISO timestamp do fim do trial — null/undefined = não renderiza. */
  trialEndsAt: string | null;
  /** Se Pro/admin/já pagou, esconde. */
  isProOrAdmin: boolean;
}

/**
 * Banner sticky no topo do shell autenticado mostrando dias restantes do trial.
 * Dismiss persiste em sessionStorage (volta no próximo login/refresh de aba).
 *
 * Não renderiza em rotas públicas (mesmas regras do AppShell) nem fora de trial.
 */
export function TrialBanner({ trialEndsAt, isProOrAdmin }: TrialBannerProps) {
  const pathname = usePathname() ?? '/';
  const [dismissed, setDismissed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    try {
      if (typeof window !== 'undefined' && window.sessionStorage.getItem(SESSION_KEY) === '1') {
        setDismissed(true);
      }
    } catch {
      // sessionStorage indisponível: tudo bem, mostra banner.
    }
  }, []);

  if (!hydrated) return null;
  if (isProOrAdmin) return null;
  if (!trialEndsAt) return null;
  if (dismissed) return null;
  if (isPublicRoute(pathname)) return null;

  const ends = new Date(trialEndsAt);
  if (Number.isNaN(ends.getTime())) return null;
  if (ends.getTime() <= Date.now()) return null;

  const days = diffDays(ends);
  const label =
    days === 1 ? '1 dia restante' : `${days} dias restantes`;

  const handleDismiss = () => {
    setDismissed(true);
    try {
      window.sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      // ignore
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'sticky top-0 z-30 flex w-full items-center justify-center gap-2',
        'border-b border-amber-500/40 bg-amber-500/10 px-3 py-2',
        'text-xs sm:text-sm text-amber-700 dark:text-amber-200',
      )}
    >
      <span className="font-medium">
        Trial Pro ativo · {label}
      </span>
      <span className="hidden text-muted-foreground sm:inline">·</span>
      <Link
        href="/conta?upgrade=1"
        className="font-semibold underline-offset-2 hover:underline"
      >
        Assinar Pro
      </Link>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Fechar banner de trial"
        className="ml-1 inline-flex h-11 w-11 items-center justify-center text-amber-700 hover:text-amber-900 sm:h-7 sm:w-7 dark:text-amber-200 dark:hover:text-amber-50"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
