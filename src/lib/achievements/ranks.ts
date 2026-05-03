/**
 * Sistema de ranks por XP — 7 patentes que escalam com o XP semanal cumulativo.
 * Cores são tokens semânticos do Tailwind (matching dos existentes em
 * `tailwind.config.ts`); usar `text-X` ou `bg-X` no componente consumidor.
 */

export interface Rank {
  id: string;
  label: string;
  minXp: number;
  nextXp: number; // XP do próximo rank (Infinity para o topo)
  color: string; // token semântico ex.: 'text-warning'
  icon: string; // lucide name
}

const RANKS: Rank[] = [
  { id: 'calouro', label: 'Calouro', minXp: 0, nextXp: 500, color: 'text-muted-foreground', icon: 'Sprout' },
  { id: 'estudante', label: 'Estudante', minXp: 500, nextXp: 2000, color: 'text-foreground', icon: 'BookOpen' },
  { id: 'candidato', label: 'Candidato', minXp: 2000, nextXp: 5000, color: 'text-info', icon: 'Notebook' },
  { id: 'aspirante', label: 'Aspirante', minXp: 5000, nextXp: 12000, color: 'text-primary', icon: 'Target' },
  { id: 'vestibulando', label: 'Vestibulando', minXp: 12000, nextXp: 25000, color: 'text-warning', icon: 'GraduationCap' },
  { id: 'quase_la', label: 'Quase Lá', minXp: 25000, nextXp: 50000, color: 'text-success', icon: 'Star' },
  { id: 'aprovado', label: 'Aprovado', minXp: 50000, nextXp: Number.POSITIVE_INFINITY, color: 'text-success', icon: 'Trophy' },
];

export function rankFromXp(xp: number): Rank {
  const safeXp = Math.max(0, Math.floor(xp || 0));
  let current = RANKS[0]!;
  for (const r of RANKS) {
    if (safeXp >= r.minXp) current = r;
    else break;
  }
  return current;
}

export function listRanks(): Rank[] {
  return [...RANKS];
}
