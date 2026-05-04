/**
 * 8 ranks da Trilha Duolingo-style. Cada rank cobre uma faixa de XP cumulativo.
 *
 * NOTE: Esta escala difere de `src/lib/achievements/ranks.ts` (que tem 7
 * patentes históricas). A trilha tem progressão própria — visualização e
 * desbloqueio por estação, não por XP semanal.
 *
 * `color` é classe utilitária Tailwind (text-*) usando tokens semânticos do
 * design system. `icon` é o nome do ícone lucide-react.
 */
import type { TrilhaRankId } from '@/lib/supabase/types';

export interface TrilhaRank {
  id: TrilhaRankId;
  label: string;
  minXp: number;
  maxXp: number; // Number.POSITIVE_INFINITY para o último
  color: string;
  icon: string;
}

const RANKS: readonly TrilhaRank[] = [
  { id: 'calouro', label: 'Calouro', minXp: 0, maxXp: 500, color: 'text-muted-foreground', icon: 'Sprout' },
  { id: 'pre_vest', label: 'Pré-vestibular', minXp: 500, maxXp: 1500, color: 'text-foreground', icon: 'BookOpen' },
  { id: 'estudante', label: 'Estudante', minXp: 1500, maxXp: 3500, color: 'text-info', icon: 'Notebook' },
  { id: 'aspirante', label: 'Aspirante', minXp: 3500, maxXp: 7000, color: 'text-primary', icon: 'Target' },
  { id: 'vestibulando', label: 'Vestibulando', minXp: 7000, maxXp: 15000, color: 'text-warning', icon: 'GraduationCap' },
  { id: 'expert', label: 'Expert', minXp: 15000, maxXp: 30000, color: 'text-success', icon: 'Star' },
  { id: 'genio', label: 'Gênio', minXp: 30000, maxXp: 50000, color: 'text-success', icon: 'Brain' },
  { id: 'aprovado', label: 'Aprovado', minXp: 50000, maxXp: Number.POSITIVE_INFINITY, color: 'text-success', icon: 'Trophy' },
];

export function listTrilhaRanks(): TrilhaRank[] {
  return [...RANKS];
}

export function trilhaRankFromXp(xp: number): TrilhaRank {
  const safeXp = Math.max(0, Math.floor(xp || 0));
  let current = RANKS[0]!;
  for (const r of RANKS) {
    if (safeXp >= r.minXp) current = r;
    else break;
  }
  return current;
}

export function trilhaRankById(id: TrilhaRankId): TrilhaRank | undefined {
  return RANKS.find((r) => r.id === id);
}

export const TRILHA_RANK_ORDER: readonly TrilhaRankId[] = RANKS.map((r) => r.id);
