/**
 * Wrapper de telemetria PostHog (client-side apenas).
 *
 * Eventos do PRD §13 sao emitidos via track(). Sem NEXT_PUBLIC_POSTHOG_KEY
 * configurada, vira no-op com console.debug em dev — codigo de chamada nao
 * precisa saber se a integracao esta ativa.
 *
 * Inicializacao lazy: o SDK so eh carregado dinamicamente quando o primeiro
 * track/identify acontece, mantendo o bundle inicial enxuto.
 */
import type { PostHog } from 'posthog-js';

let posthog: PostHog | null = null;
let initStarted = false;
let initPromise: Promise<void> | null = null;

function envKey(): string | null {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  return key && key.length > 0 ? key : null;
}

async function ensureInit(): Promise<void> {
  if (initStarted && initPromise) return initPromise;
  initStarted = true;
  initPromise = (async () => {
    if (typeof window === 'undefined') return;
    const key = envKey();
    if (!key) return;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.posthog.com';
    const mod = await import('posthog-js');
    mod.default.init(key, {
      api_host: host,
      capture_pageview: false,
      capture_pageleave: true,
      autocapture: false,
      persistence: 'localStorage+cookie',
      person_profiles: 'identified_only',
      // Feature flags exigem configuração extra do projeto PostHog. Sem isso,
      // a chamada /flags retorna 401 e polui o console — desligamos por enquanto.
      advanced_disable_feature_flags: true,
      advanced_disable_feature_flags_on_first_load: true,
    });
    posthog = mod.default;
  })();
  return initPromise;
}

function fallbackLog(kind: string, ...args: unknown[]): void {
  if (process.env.NODE_ENV !== 'production') {
    console.debug(`[analytics:${kind}]`, ...args);
  }
}

export function track(event: string, properties?: Record<string, unknown>): void {
  void ensureInit().then(() => {
    if (!posthog) {
      fallbackLog('track', event, properties);
      return;
    }
    posthog.capture(event, properties);
  });
}

export function identify(userId: string, properties?: Record<string, unknown>): void {
  void ensureInit().then(() => {
    if (!posthog) {
      fallbackLog('identify', userId, properties);
      return;
    }
    posthog.identify(userId, properties);
  });
}

export function reset(): void {
  void ensureInit().then(() => {
    if (!posthog) {
      fallbackLog('reset');
      return;
    }
    posthog.reset();
  });
}

export function pageview(url: string): void {
  void ensureInit().then(() => {
    if (!posthog) {
      fallbackLog('pageview', url);
      return;
    }
    posthog.capture('$pageview', { $current_url: url });
  });
}
