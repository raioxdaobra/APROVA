/**
 * Badge inline mostrando o rank atual do usuário com base no XP semanal.
 * Server-OK: lookup é puro a partir de `xp` numérico.
 */

import {
  BookOpen,
  GraduationCap,
  Notebook,
  Sprout,
  Star,
  Target,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { rankFromXp } from '@/lib/achievements/ranks';

const ICONS: Record<string, LucideIcon> = {
  Sprout,
  BookOpen,
  Notebook,
  Target,
  GraduationCap,
  Star,
  Trophy,
};

export interface RankBadgeProps {
  xp: number;
  className?: string;
}

export function RankBadge({ xp, className }: RankBadgeProps) {
  const rank = rankFromXp(xp);
  const Icon = ICONS[rank.icon] ?? Sprout;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-semibold',
        rank.color,
        className,
      )}
      title={`Rank: ${rank.label} — ${xp} XP`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {rank.label}
    </span>
  );
}
