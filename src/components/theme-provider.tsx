'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'aprova-theme';

function getSystemPreference(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
      // Migra valores antigos 'system' pra preferência do sistema concreta.
      let initial: Theme;
      if (stored === 'light' || stored === 'dark') {
        initial = stored;
      } else if (stored === 'system') {
        initial = getSystemPreference();
        try {
          window.localStorage.setItem(STORAGE_KEY, initial);
        } catch {
          /* ignore */
        }
      } else {
        initial = getSystemPreference();
      }
      applyTheme(initial);
      setThemeState(initial);
      setResolvedTheme(initial);
    } catch {
      /* localStorage indisponível */
      setResolvedTheme(getSystemPreference());
    }
  }, []);

  const setTheme = (next: Theme) => {
    // Coage 'system' pra resolução concreta — só persistimos light|dark.
    const resolved: ResolvedTheme = next === 'system' ? getSystemPreference() : next;
    try {
      window.localStorage.setItem(STORAGE_KEY, resolved);
    } catch {
      /* localStorage indisponível */
    }
    applyTheme(resolved);
    setThemeState(resolved);
    setResolvedTheme(resolved);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>{children}</ThemeContext.Provider>
  );
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  // Sempre aplica light|dark concreto. 'system' já foi resolvido antes.
  if (theme === 'light' || theme === 'dark') {
    root.classList.add(theme);
  } else {
    root.classList.add(getSystemPreference());
  }
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
