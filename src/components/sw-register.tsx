'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister(): null {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch((err: unknown) => {
      // eslint-disable-next-line no-console
      console.error('SW registration failed', err);
    });
  }, []);
  return null;
}
