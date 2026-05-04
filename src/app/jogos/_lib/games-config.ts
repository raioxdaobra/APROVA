/**
 * Catálogo dos 10 mini-games do APROVA.
 *
 * O componente real do jogo (Game.tsx) é dono dos worktrees W5/W6 e mora em
 * `src/games/<id>/Game.tsx`. Este arquivo apenas centraliza a metadata
 * (cover/cor/nome/descrição) usada pelo lobby, ranking e bib de slugs.
 */

import type { GameId } from '@/lib/supabase/types';

export interface GameMeta {
  id: GameId;
  name: string;
  description: string;
  /** Emoji usado como capa enquanto não temos arte. */
  cover: string;
  /** Classe Tailwind para o gradient do card (bg-gradient-to-br). */
  gradient: string;
}

export const GAMES: GameMeta[] = [
  {
    id: 'mate_speed',
    name: 'Mate Speed',
    description: 'Resolva contas rápidas contra o cronômetro.',
    cover: '➕',
    gradient: 'from-orange-400 to-rose-500',
  },
  {
    id: 'wordle',
    name: 'Termo Médico',
    description: 'Acerte o termo médico em 6 tentativas.',
    cover: '🔤',
    gradient: 'from-emerald-400 to-teal-600',
  },
  {
    id: 'memory_periodic',
    name: 'Memória Periódica',
    description: 'Pares de elementos da tabela periódica.',
    cover: '⚛️',
    gradient: 'from-violet-400 to-purple-600',
  },
  {
    id: 'snake_anatomy',
    name: 'Snake Anatomia',
    description: 'Coma órgãos na ordem do sistema certo.',
    cover: '🐍',
    gradient: 'from-lime-400 to-green-600',
  },
  {
    id: '2048',
    name: '2048 Médico',
    description: 'Junte conceitos crescentes até o topo.',
    cover: '🧠',
    gradient: 'from-amber-400 to-orange-600',
  },
  {
    id: 'trunfo',
    name: 'Super Trunfo',
    description: 'Cartas de cientistas, escolha o melhor atributo.',
    cover: '🃏',
    gradient: 'from-sky-400 to-blue-600',
  },
  {
    id: 'corrida',
    name: 'Corrida do Saber',
    description: 'Acerte questões pra acelerar até a linha de chegada.',
    cover: '🏁',
    gradient: 'from-red-400 to-rose-600',
  },
  {
    id: 'sudoku',
    name: 'Sudoku',
    description: 'Lógica clássica em 9x9, três níveis.',
    cover: '🔢',
    gradient: 'from-indigo-400 to-blue-700',
  },
  {
    id: 'logica',
    name: 'Charadas Lógicas',
    description: 'Enigmas curtos pra esquentar o raciocínio.',
    cover: '🧩',
    gradient: 'from-fuchsia-400 to-pink-600',
  },
  {
    id: 'hanoi',
    name: 'Torre de Hanoi',
    description: 'Mova os discos no menor número de jogadas.',
    cover: '🗼',
    gradient: 'from-cyan-400 to-teal-600',
  },
];

export function getGameMeta(id: string): GameMeta | undefined {
  return GAMES.find((g) => g.id === id);
}

/** Tempo mínimo de foco hoje pra desbloquear o lobby (em minutos). */
export const FOCUS_GATE_MINUTES = 15;

/** Duração do ciclo de foco do pomodoro, em minutos. Espelha use-pomodoro. */
export const POMODORO_FOCUS_MINUTES = 25;

/** Evento customizado que o pomodoro dispara ao finalizar um ciclo de foco. */
export const FOCUS_COMPLETE_EVENT = 'aprova:focus-complete';
