'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt: () => Promise<void>;
}

const DISMISS_KEY = 'aprova-install-dismissed';

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia?.('(display-mode: standalone)').matches) return true;
  // iOS Safari uses navigator.standalone
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true;
}

function isIos(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export function InstallPrompt(): JSX.Element | null {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIos, setShowIos] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let storedDismiss = false;
    try {
      storedDismiss = window.localStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      storedDismiss = false;
    }
    if (storedDismiss) {
      setDismissed(true);
      return;
    }
    if (isStandalone()) {
      setDismissed(true);
      return;
    }
    setDismissed(false);

    const onBeforeInstall = (e: Event): void => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);

    const onInstalled = (): void => {
      setDeferred(null);
      setShowIos(false);
      setDismissed(true);
    };
    window.addEventListener('appinstalled', onInstalled);

    if (isIos()) {
      setShowIos(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const handleDismiss = (): void => {
    try {
      window.localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // no-op
    }
    setDismissed(true);
  };

  const handleInstall = async (): Promise<void> => {
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

  if (dismissed) return null;
  if (!deferred && !showIos) return null;

  const message = deferred
    ? 'Instale o APROVA na sua tela inicial'
    : "Toque no botão Compartilhar e escolha 'Adicionar à Tela de Início'";

  return (
    <div
      role="dialog"
      aria-label="Instalar APROVA"
      className="fixed inset-x-0 bottom-0 z-40 mx-auto flex w-full max-w-sm items-center gap-3 border-t border-border bg-background/95 px-4 py-3 shadow-lg backdrop-blur"
    >
      <p className="flex-1 text-sm text-foreground">{message}</p>
      {deferred ? (
        <Button type="button" size="sm" variant="primary" onClick={handleInstall}>
          Instalar
        </Button>
      ) : null}
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Fechar"
        className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
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
  );
}
