'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  // Toggle simples claro <-> escuro. Removido modo "Sistema".
  const next = resolvedTheme === 'dark' ? 'light' : 'dark';
  const icon = resolvedTheme === 'dark' ? <Moon size={18} /> : <Sun size={18} />;
  const label = resolvedTheme === 'dark' ? 'Escuro' : 'Claro';

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={() => setTheme(next)}
      aria-label={`Tema atual: ${label}. Trocar para ${next === 'dark' ? 'escuro' : 'claro'}.`}
    >
      <span className="mr-2">{icon}</span>
      {label}
    </Button>
  );
}
