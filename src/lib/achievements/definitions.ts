/**
 * Definições dos 15 badges de gamificação. Os IDs aqui devem casar com o
 * seed da migration de gamification (worktree A).
 *
 * Cada badge tem:
 *  - id: chave primária estável
 *  - title: nome curto
 *  - description: explicação humana
 *  - icon: nome de ícone do `lucide-react`
 *  - rarity: common | rare | epic | legendary
 *  - check(ctx): retorna true quando o usuário tem direito ao badge
 *
 * O contexto (`AchievementContext`) é construído por `evaluateAfterAttempt`
 * em `check.ts` a partir do estado atual do usuário no banco.
 */

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface AchievementContext {
  userId: string;
  totalAttempts: number;
  dailyAttempts: number;
  currentStreak: number;
  dominions: string[]; // ids de discipline com mastery
  hour: number; // hora local (0-23)
  dayOfWeek: number; // 0=Sun .. 6=Sat
  sundayCount: number; // qtd de domingos com >= 1 attempt
  recoveryCount: number; // qtd de retomadas após break (heurística)
}

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: string; // lucide icon name
  rarity: Rarity;
  check: (ctx: AchievementContext) => boolean;
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'first_q',
    title: 'Primeira questão',
    description: 'Você respondeu sua primeira questão.',
    icon: 'Sparkles',
    rarity: 'common',
    check: (c) => c.totalAttempts >= 1,
  },
  {
    id: 'marathon_50',
    title: 'Maratona',
    description: 'Você fez 50 questões em um único dia.',
    icon: 'Zap',
    rarity: 'rare',
    check: (c) => c.dailyAttempts >= 50,
  },
  {
    id: 'streak_7',
    title: 'Constância (7 dias)',
    description: '7 dias seguidos de estudo.',
    icon: 'Flame',
    rarity: 'common',
    check: (c) => c.currentStreak >= 7,
  },
  {
    id: 'streak_30',
    title: 'Disciplina (30 dias)',
    description: '30 dias seguidos sem falhar.',
    icon: 'Flame',
    rarity: 'rare',
    check: (c) => c.currentStreak >= 30,
  },
  {
    id: 'streak_100',
    title: 'Lendário (100 dias)',
    description: '100 dias seguidos. Lenda viva.',
    icon: 'Flame',
    rarity: 'legendary',
    check: (c) => c.currentStreak >= 100,
  },
  {
    id: 'domain_mat',
    title: 'Domínio em Matemática',
    description: 'Dominou todos os subtópicos de Matemática.',
    icon: 'Sigma',
    rarity: 'epic',
    check: (c) => c.dominions.includes('matematica'),
  },
  {
    id: 'domain_fis',
    title: 'Domínio em Física',
    description: 'Dominou todos os subtópicos de Física.',
    icon: 'Atom',
    rarity: 'epic',
    check: (c) => c.dominions.includes('fisica'),
  },
  {
    id: 'domain_qui',
    title: 'Domínio em Química',
    description: 'Dominou todos os subtópicos de Química.',
    icon: 'FlaskConical',
    rarity: 'epic',
    check: (c) => c.dominions.includes('quimica'),
  },
  {
    id: 'domain_bio',
    title: 'Domínio em Biologia',
    description: 'Dominou todos os subtópicos de Biologia.',
    icon: 'Leaf',
    rarity: 'epic',
    check: (c) => c.dominions.includes('biologia'),
  },
  {
    id: 'domain_hum',
    title: 'Domínio em Humanas',
    description: 'Dominou todos os subtópicos de Humanas.',
    icon: 'Globe',
    rarity: 'epic',
    check: (c) => c.dominions.includes('humanas'),
  },
  {
    id: 'morning_owl',
    title: 'Madrugador',
    description: 'Estudou antes das 6h da manhã.',
    icon: 'Sunrise',
    rarity: 'rare',
    check: (c) => c.hour < 6,
  },
  {
    id: 'night_owl',
    title: 'Coruja',
    description: 'Estudou depois das 23h.',
    icon: 'Moon',
    rarity: 'rare',
    check: (c) => c.hour >= 23,
  },
  {
    id: 'sunday_grinder',
    title: 'Sunday grinder',
    description: 'Estudou em 4 domingos.',
    icon: 'CalendarDays',
    rarity: 'rare',
    check: (c) => c.sundayCount >= 4,
  },
  {
    id: 'polymath',
    title: 'Polímata',
    description: 'Dominou subtópicos de pelo menos 3 disciplinas.',
    icon: 'Award',
    rarity: 'legendary',
    check: (c) => c.dominions.length >= 3,
  },
  {
    id: 'streak_recovery',
    title: 'Resiliente',
    description: 'Voltou aos estudos após um break — 3 vezes.',
    icon: 'Undo2',
    rarity: 'rare',
    check: (c) => c.recoveryCount >= 3,
  },
];

export function getAchievement(id: string): AchievementDefinition | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
