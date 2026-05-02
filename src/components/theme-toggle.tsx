'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const next = (() => {
    if (theme === 'system') return 'light';
    if (theme === 'light') return 'dark';
    return 'system';
  })();

  const icon =
    theme === 'light' ? <Sun size={18} /> : theme === 'dark' ? <Moon size={18} /> : <Monitor size={18} />;
  const label = theme === 'light' ? 'Claro' : theme === 'dark' ? 'Escuro' : 'Sistema';

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={() => setTheme(next)}
      aria-label={`Tema atual: ${label}. Trocar.`}
    >
      <span className="mr-2">{icon}</span>
      {label}
    </Button>
  );
}
