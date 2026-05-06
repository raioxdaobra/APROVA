'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'aprova:sidebar:collapsed';

export function useSidebarState(): {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  toggle: () => void;
  hydrated: boolean;
} {
  const [collapsed, setCollapsedState] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw === '1') setCollapsedState(true);
    } catch {
      // no-op
    }
    setHydrated(true);
  }, []);

  const setCollapsed = (v: boolean) => {
    setCollapsedState(v);
    try {
      window.localStorage.setItem(STORAGE_KEY, v ? '1' : '0');
    } catch {
      // no-op
    }
  };

  return { collapsed, setCollapsed, toggle: () => setCollapsed(!collapsed), hydrated };
}
