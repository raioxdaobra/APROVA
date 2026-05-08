'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt: () => Promise<void>;
}

const DISMISS_KEY = 'aprova-install-dismissed-at';
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const SHOW_DELAY_MS = 800; // deixa a página pintar antes

type Platform = 'ios' | 'android-chrome' | 'desktop' | 'other';

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia?.('(display-mode: standalone)').matches) return true;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true;
}

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android-chrome';
  if (/Chrome|Chromium|Edg/.test(ua) && !/Mobile/.test(ua)) return 'desktop';
  return 'other';
}

function readDismissedAt(): number | null {
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY);
    if (!raw) return null;
    const ts = Number.parseInt(raw, 10);
    return Number.isFinite(ts) ? ts : null;
  } catch {
    return null;
  }
}

function isDismissedRecently(): boolean {
  const ts = readDismissedAt();
  if (ts === null) return false;
  return Date.now() - ts < DISMISS_TTL_MS;
}

export function InstallPrompt(): JSX.Element | null {
  const pathname = usePathname() ?? '/';
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState<Platform>('other');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isStandalone() || isDismissedRecently()) return;
    // Não mostra na página dedicada de instalação
    if (pathname === '/instalar') return;

    const detected = detectPlatform();
    setPlatform(detected);

    const onBeforeInstall = (e: Event): void => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);

    const onInstalled = (): void => {
      setDeferred(null);
      setVisible(false);
    };
    window.addEventListener('appinstalled', onInstalled);

    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleDismiss = (): void => {
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // no-op
    }
    setDeferred(null);
    setVisible(false);
  };

  const handleNativeInstall = async (): Promise<void> => {
    if (!deferred) return;
    try {
      await deferred.prompt();
      await deferred.userChoice;
    } catch {
      // ignore
    }
    setDeferred(null);
    handleDismiss();
  };

  if (!visible) return null;

  const canNativeInstall = deferred !== null;
  const isIos = platform === 'ios';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-title"
      className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-3 sm:px-4 sm:pb-4 motion-safe:animate-[install-slide_320ms_ease-out]"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-[0_24px_60px_-12px_rgba(0,0,0,0.4)]">
        <div className="flex items-start gap-3 p-4 sm:p-5">
          <div
            aria-hidden="true"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md"
          >
            <span className="text-lg font-bold tracking-tight">A</span>
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="install-title" className="text-base font-semibold text-foreground">
              Instale o APROVA
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Adicione à tela inicial e estude offline em 1 toque.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Fechar"
            className="-mr-1 -mt-1 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M3 3l10 10M13 3L3 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {canNativeInstall ? (
          <div className="border-t border-border bg-background/50 px-4 py-3 sm:px-5 sm:py-4">
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={handleNativeInstall}
              className="w-full"
            >
              Adicionar à tela inicial
            </Button>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Sem pesar no celular · Funciona offline
            </p>
          </div>
        ) : isIos ? (
          <div className="border-t border-border bg-background/50 px-4 py-4 sm:px-5">
            <ol className="flex flex-col gap-2 text-sm text-foreground">
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                  1
                </span>
                <span>
                  Toque no botão{' '}
                  <span className="inline-flex items-center gap-1 align-middle font-medium text-foreground">
                    Compartilhar
                    <ShareIosIcon />
                  </span>{' '}
                  no Safari
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                  2
                </span>
                <span>
                  Role e escolha{' '}
                  <span className="font-medium text-foreground">
                    Adicionar à Tela de Início
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                  3
                </span>
                <span>
                  Toque em{' '}
                  <span className="font-medium text-foreground">Adicionar</span> — pronto, abre como app.
                </span>
              </li>
            </ol>
          </div>
        ) : (
          <div className="border-t border-border bg-background/50 px-4 py-3 sm:px-5">
            <Link
              href="/instalar"
              className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Ver instruções de instalação
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function ShareIosIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="inline-block text-primary"
    >
      <path d="M12 16V4" />
      <path d="M7 9l5-5 5 5" />
      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
    </svg>
  );
}
