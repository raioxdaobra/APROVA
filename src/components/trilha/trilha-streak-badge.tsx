'use client';

/**
 * <TrilhaStreakBadge> — badge "🔥 N dias seguidos" com tooltip.
 *
 * PR 27. Pulsa quando streak >= 7. Tap target ≥ 44px no mobile via padding.
 */
import { useState } from 'react';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STREAK_TOOLTIP, streakMultiplier } from '@/lib/trilha/streak';

export interface TrilhaStreakBadgeProps {
  streakDays: number;
}

export function TrilhaStreakBadge({ streakDays }: TrilhaStreakBadgeProps) {
  const [open, setOpen] = useState(false);
  const mult = streakMultiplier(streakDays);
  const isHot = streakDays >= 7;
  const isWarm = streakDays >= 3;

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Streak da trilha: ${streakDays} dias seguidos. Multiplier ${mult}x`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setOpen(false)}
        className={cn(
          'inline-flex h-11 min-w-11 items-center gap-1.5 rounded-full border-2 px-3 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          isHot
            ? 'animate-pulse border-orange-500 bg-orange-100 text-orange-700 dark:border-orange-400 dark:bg-orange-950/50 dark:text-orange-200'
            : isWarm
              ? 'border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-500 dark:bg-amber-950/40 dark:text-amber-200'
              : 'border-border bg-card text-muted-foreground hover:bg-muted',
        )}
      >
        <Flame
          className={cn('h-4 w-4', isHot ? 'text-orange-500' : isWarm ? 'text-amber-500' : '')}
          aria-hidden="true"
        />
        <span>
          {streakDays} dia{streakDays === 1 ? '' : 's'}
        </span>
        <span className="ml-1 rounded-full bg-foreground/10 px-1.5 py-0.5 text-[10px] font-mono">
          {mult}x
        </span>
      </button>
      {open && (
        <div
          role="tooltip"
          className="absolute right-0 top-full z-30 mt-2 w-60 rounded-lg border border-border bg-popover p-3 text-xs shadow-lg"
        >
          <p className="font-semibold text-foreground">{STREAK_TOOLTIP}</p>
          <ul className="mt-2 space-y-0.5 font-mono text-muted-foreground">
            <li>• 0-2 dias: 1.0x</li>
            <li>• 3-6 dias: 1.25x</li>
            <li>• 7+ dias: 1.5x</li>
          </ul>
        </div>
      )}
    </div>
  );
}
