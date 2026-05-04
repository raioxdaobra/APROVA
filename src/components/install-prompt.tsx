'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt: () => Promise<void>;
}

const DISMISS_KEY = 'aprova-install-dismissed-at';
const FIRST_QUESTION_KEY = 'aprova-first-question-completed';
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const ENGAGEMENT_DELAY_MS = 60 * 1000; // 60 seconds of navigation

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

function hasCompletedFirstQuestion(): boolean {
  try {
    return window.localStorage.getItem(FIRST_QUESTION_KEY) === '1';
  } catch {
    return false;
  }
}

export function InstallPrompt(): JSX.Element | null {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIos, setShowIos] = useState(false);
  const [eligible, setEligible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (isStandalone() || isDismissedRecently()) {
      return;
    }

    const onBeforeInstall = (e: Event): void => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);

    const onInstalled = (): void => {
      setDeferred(null);
      setShowIos(false);
      setEligible(false);
    };
    window.addEventListener('appinstalled', onInstalled);

    if (isIos()) {
      setShowIos(true);
    }

    // Engagement gates: 60s timer OR first-question signal (whichever first).
    let timer: ReturnType<typeof setTimeout> | null = null;

    const markEligible = (): void => {
      setEligible(true);
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
    };

    if (hasCompletedFirstQuestion()) {
      markEligible();
    } else {
      timer = setTimeout(markEligible, ENGAGEMENT_DELAY_MS);
    }

    const onFirstQuestion = (): void => {
      try {
        window.localStorage.setItem(FIRST_QUESTION_KEY, '1');
      } catch {
        // no-op
      }
      markEligible();
    };
    window.addEventListener('aprova:question-completed', onFirstQuestion);

    const onStorage = (e: StorageEvent): void => {
      if (e.key === FIRST_QUESTION_KEY && e.newValue === '1') {
        markEligible();
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
      window.removeEventListener('aprova:question-completed', onFirstQuestion);
      window.removeEventListener('storage', onStorage);
      if (timer !== null) clearTimeout(timer);
    };
  }, []);

  const handleDismiss = (): void => {
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // no-op
    }
    setDeferred(null);
    setShowIos(false);
    setEligible(false);
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

  if (!eligible) return null;
  if (!deferred && !showIos) return null;

  const message = deferred
    ? 'Instale o APROVA na sua tela inicial'
    : "Toque no botão Compartilhar e escolha 'Adicionar à Tela de Início'";

  return (
    <div
      role="dialog"
      aria-label="Instalar APROVA"
      className="fixed inset-x-0 bottom-0 z-40 mx-auto flex w-full max-w-sm items-center gap-3 border-t border-border bg-background/95 px-4 py-3 shadow-lg backdrop-blur"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}
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
