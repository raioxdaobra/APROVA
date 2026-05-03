'use client';

/**
 * Modal celebratório quando o usuário sobe de rank. Dispara confete e
 * level-up sound ao abrir. Usa <dialog> nativo (mesmo pattern do
 * delete-account-section). `open` é controlado externamente; `onClose`
 * é chamado quando o user fecha.
 */

import { useEffect, useRef } from 'react';
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
import { Button } from '@/components/ui/button';
import { rankFromXp } from '@/lib/achievements/ranks';
import { getAudioPlayer } from '@/lib/audio/player';
import { ConfettiBurst } from './confetti-burst';

const ICONS: Record<string, LucideIcon> = {
  Sprout,
  BookOpen,
  Notebook,
  Target,
  GraduationCap,
  Star,
  Trophy,
};

export interface RankUpModalProps {
  open: boolean;
  xp: number;
  onClose: () => void;
}

export function RankUpModal({ open, xp, onClose }: RankUpModalProps) {
  const ref = useRef<HTMLDialogElement | null>(null);
  const rank = rankFromXp(xp);
  const Icon = ICONS[rank.icon] ?? Sprout;

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (open && !dlg.open) {
      dlg.showModal();
      try {
        getAudioPlayer().play('levelUp');
      } catch {
        /* noop */
      }
    } else if (!open && dlg.open) {
      dlg.close();
    }
  }, [open]);

  return (
    <>
      <ConfettiBurst trigger={open} intensity="big" />
      <dialog
        ref={ref}
        onClose={onClose}
        className="m-auto w-full max-w-sm rounded-lg border border-border bg-card p-6 text-foreground shadow-lg backdrop:bg-foreground/40"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div className={`flex h-16 w-16 items-center justify-center rounded-full bg-muted ${rank.color}`}>
            <Icon className="h-8 w-8" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-semibold">Você subiu de rank!</h2>
          <p className="text-sm text-muted-foreground">
            Agora você é <span className={`font-semibold ${rank.color}`}>{rank.label}</span>.
            {Number.isFinite(rank.nextXp) ? ` Continue — faltam ${Math.max(0, rank.nextXp - xp)} XP pro próximo.` : ' Topo do ranking. Lenda.'}
          </p>
          <Button type="button" size="md" onClick={() => ref.current?.close()}>
            Continuar estudando
          </Button>
        </div>
      </dialog>
    </>
  );
}
