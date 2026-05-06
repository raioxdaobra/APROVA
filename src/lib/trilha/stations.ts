/**
 * Helpers e constantes da Trilha RPG (PR 26).
 *
 * - 8 ranks com tema visual (cor de fundo, label, ícone).
 * - 5 estações por rank, estação 5 sempre é boss.
 * - Adaptive unlock: estação só desbloqueia se a anterior foi `is_passed`.
 *
 * Tipos espelham `user_trilha_full_v2` (view criada na migration 0027).
 * Mantemos um shape leve que pode ser tipado manualmente até o regen
 * automático de `supabase/types.ts`.
 */
import type { Discipline } from '@/lib/supabase/types';

export type TrilhaRankNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface TrilhaRankTheme {
  rank: TrilhaRankNumber;
  label: string;
  subtitle: string;
  /** Tailwind classes para gradiente de fundo da seção do rank. */
  bgClass: string;
  /** Cor primária do rank (texto/borda em estações). */
  accentClass: string;
  /** Nome do ícone lucide-react. */
  iconName:
    | 'Sprout'
    | 'Mountain'
    | 'BookOpen'
    | 'Building2'
    | 'Flame'
    | 'Waves'
    | 'FlaskConical'
    | 'Crown';
}

export const TRILHA_RANK_THEMES: readonly TrilhaRankTheme[] = [
  {
    rank: 1,
    label: 'Iniciação',
    subtitle: 'Floresta dos primeiros passos',
    bgClass: 'from-emerald-100/60 via-emerald-50/40 to-transparent dark:from-emerald-950/30 dark:via-emerald-900/20',
    accentClass: 'text-emerald-700 dark:text-emerald-300',
    iconName: 'Sprout',
  },
  {
    rank: 2,
    label: 'Fundamentos',
    subtitle: 'Montanha dos pilares',
    bgClass: 'from-stone-200/60 via-stone-100/40 to-transparent dark:from-stone-800/40 dark:via-stone-900/30',
    accentClass: 'text-stone-700 dark:text-stone-300',
    iconName: 'Mountain',
  },
  {
    rank: 3,
    label: 'Linguagens',
    subtitle: 'Biblioteca dos saberes',
    bgClass: 'from-orange-100/60 via-orange-50/40 to-transparent dark:from-orange-950/30 dark:via-orange-900/20',
    accentClass: 'text-orange-700 dark:text-orange-300',
    iconName: 'BookOpen',
  },
  {
    rank: 4,
    label: 'Humanas',
    subtitle: 'Cidade do pensamento',
    bgClass: 'from-purple-100/60 via-purple-50/40 to-transparent dark:from-purple-950/30 dark:via-purple-900/20',
    accentClass: 'text-purple-700 dark:text-purple-300',
    iconName: 'Building2',
  },
  {
    rank: 5,
    label: 'Exatas Avançadas',
    subtitle: 'Vulcão da lógica',
    bgClass: 'from-orange-200/70 via-rose-100/50 to-transparent dark:from-rose-950/30 dark:via-orange-950/20',
    accentClass: 'text-rose-700 dark:text-rose-300',
    iconName: 'Flame',
  },
  {
    rank: 6,
    label: 'Bio Avançado',
    subtitle: 'Oceano da vida',
    bgClass: 'from-sky-100/60 via-blue-50/40 to-transparent dark:from-sky-950/30 dark:via-blue-900/20',
    accentClass: 'text-sky-700 dark:text-sky-300',
    iconName: 'Waves',
  },
  {
    rank: 7,
    label: 'Química Avançada',
    subtitle: 'Laboratório dos elementos',
    bgClass: 'from-teal-100/60 via-teal-50/40 to-transparent dark:from-teal-950/30 dark:via-teal-900/20',
    accentClass: 'text-teal-700 dark:text-teal-300',
    iconName: 'FlaskConical',
  },
  {
    rank: 8,
    label: 'Mestre',
    subtitle: 'Trono da aprovação',
    bgClass: 'from-amber-200/70 via-yellow-100/50 to-transparent dark:from-amber-950/40 dark:via-yellow-900/20',
    accentClass: 'text-amber-700 dark:text-amber-300',
    iconName: 'Crown',
  },
];

export function getRankTheme(rank: number): TrilhaRankTheme {
  return TRILHA_RANK_THEMES[rank - 1] ?? TRILHA_RANK_THEMES[0]!;
}

/** Ícone lucide específico de cada disciplina, pra usar nos nodes. */
export const DISCIPLINE_ICON_NAME: Record<Discipline, string> = {
  matematica: 'Calculator',
  fisica: 'Atom',
  quimica: 'FlaskConical',
  biologia: 'Leaf',
  humanas: 'Landmark',
  linguagens: 'BookOpenText',
};

/** Cor hex (paleta APROVA) por disciplina — usada inline em SVG. */
export const DISCIPLINE_COLOR_HEX: Record<Discipline, string> = {
  matematica: '#2563EB',
  fisica: '#6366F1',
  quimica: '#14B8A6',
  biologia: '#16A34A',
  humanas: '#9333EA',
  linguagens: '#F97316',
};

/** Tailwind class (bg-*) por disciplina. */
export const DISCIPLINE_BG_CLASS: Record<Discipline, string> = {
  matematica: 'bg-blue-600',
  fisica: 'bg-indigo-500',
  quimica: 'bg-teal-500',
  biologia: 'bg-green-600',
  humanas: 'bg-purple-600',
  linguagens: 'bg-orange-500',
};

/** Tipo da Row da view `user_trilha_full_v2` (até regen do types.ts). */
export interface TrilhaStationRPG {
  id: string;
  rank: number;
  position_in_rank: number;
  rank_id: string;
  position: number;
  title: string;
  description: string;
  discipline: Discipline;
  subtopic: string | null;
  is_boss: boolean;
  question_count: number;
  passing_pct: number;
  xp_reward: number;
  badge_reward: string | null;
  unlocks_after: string | null;
  best_score_pct: number;
  attempts_count: number;
  last_attempt_at: string | null;
  is_passed: boolean;
  is_unlocked: boolean;
}

export type StationVisualState = 'completed' | 'next' | 'available' | 'locked' | 'boss-locked' | 'boss-available' | 'boss-completed';

/** Calcula estado visual da estação considerando a próxima estação a fazer. */
export function getStationVisualState(
  station: TrilhaStationRPG,
  isNextToDo: boolean,
): StationVisualState {
  if (station.is_passed) {
    return station.is_boss ? 'boss-completed' : 'completed';
  }
  if (!station.is_unlocked) {
    return station.is_boss ? 'boss-locked' : 'locked';
  }
  if (station.is_boss) return 'boss-available';
  if (isNextToDo) return 'next';
  return 'available';
}

/** A "próxima a fazer" é a primeira estação na ordem do rank/posição que está
 *  desbloqueada e ainda não passou. */
export function findNextStationId(stations: TrilhaStationRPG[]): string | null {
  const sorted = [...stations].sort((a, b) =>
    a.rank !== b.rank ? a.rank - b.rank : a.position_in_rank - b.position_in_rank,
  );
  const next = sorted.find((s) => s.is_unlocked && !s.is_passed);
  return next?.id ?? null;
}

export function groupByRank(stations: TrilhaStationRPG[]): Map<number, TrilhaStationRPG[]> {
  const map = new Map<number, TrilhaStationRPG[]>();
  for (const s of stations) {
    const arr = map.get(s.rank) ?? [];
    arr.push(s);
    map.set(s.rank, arr);
  }
  // Ordenar cada grupo por position_in_rank.
  for (const [k, v] of map.entries()) {
    v.sort((a, b) => a.position_in_rank - b.position_in_rank);
    map.set(k, v);
  }
  return map;
}

/** Total de estações concluídas / total. Usado no header. */
export function calcOverallProgress(stations: TrilhaStationRPG[]): {
  completed: number;
  total: number;
  pct: number;
  xpEarned: number;
} {
  const completed = stations.filter((s) => s.is_passed).length;
  const total = stations.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const xpEarned = stations
    .filter((s) => s.is_passed)
    .reduce((sum, s) => sum + (s.xp_reward ?? 0), 0);
  return { completed, total, pct, xpEarned };
}
