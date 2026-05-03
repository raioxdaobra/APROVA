'use client';

/**
 * Toast celebratório para badges desbloqueados. Usa o `sonner` global
 * (já montado em `layout.tsx`) e dispara confete em paralelo. Para
 * múltiplos badges desbloqueados em uma só chamada, encadeia toasts
 * com pequeno delay.
 */

import { toast } from 'sonner';
import {
  Award,
  Atom,
  BookOpen,
  CalendarDays,
  Flame,
  FlaskConical,
  Globe,
  GraduationCap,
  Leaf,
  Moon,
  Notebook,
  Sigma,
  Sparkles,
  Sprout,
  Star,
  Sunrise,
  Target,
  Trophy,
  Undo2,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { UnlockedBadge } from '@/lib/achievements/check';

const ICONS: Record<string, LucideIcon> = {
  Award,
  Atom,
  BookOpen,
  CalendarDays,
  Flame,
  FlaskConical,
  Globe,
  GraduationCap,
  Leaf,
  Moon,
  Notebook,
  Sigma,
  Sparkles,
  Sprout,
  Star,
  Sunrise,
  Target,
  Trophy,
  Undo2,
  Zap,
};

const RARITY_CLASS: Record<UnlockedBadge['rarity'], string> = {
  common: 'text-muted-foreground',
  rare: 'text-info',
  epic: 'text-primary',
  legendary: 'text-warning',
};

function fireConfetti() {
  if (typeof window === 'undefined') return;
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  } catch {
    /* ignore */
  }
  void import('canvas-confetti').then((mod) => {
    try {
      mod.default({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 },
      });
    } catch {
      /* ignore */
    }
  });
}

function showOne(badge: UnlockedBadge) {
  const Icon = ICONS[badge.icon] ?? Sparkles;
  const rarity = RARITY_CLASS[badge.rarity];
  toast.custom(
    (t) => (
      <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 shadow-md">
        <div className={`mt-0.5 ${rarity}`}>
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="flex flex-1 flex-col gap-0.5">
          <span className="text-sm font-semibold text-foreground">
            Badge desbloqueado: {badge.title}
          </span>
          <span className="text-xs text-muted-foreground">{badge.description}</span>
        </div>
        <button
          type="button"
          onClick={() => {
            toast.dismiss(t);
            if (typeof window !== 'undefined') {
              window.location.href = '/configuracoes';
            }
          }}
          className="text-xs font-semibold text-primary hover:underline"
        >
          Ver perfil
        </button>
      </div>
    ),
    { duration: 4500 },
  );
}

/**
 * Exibe toast(s) e dispara confete. Aceita um único badge ou array.
 */
export function showAchievementToast(badges: UnlockedBadge | UnlockedBadge[]): void {
  const list = Array.isArray(badges) ? badges : [badges];
  if (list.length === 0) return;
  fireConfetti();
  for (let i = 0; i < list.length; i++) {
    const b = list[i]!;
    if (i === 0) {
      showOne(b);
    } else {
      window.setTimeout(() => showOne(b), 700 * i);
    }
  }
}
