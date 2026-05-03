/**
 * Geração diária de missões.
 *
 * Cada usuário recebe 3 missões/dia, sorteadas determinísticamente a partir
 * de uma pool fixa. O determinismo é importante: se o usuário recarregar a
 * página, queremos que o conjunto de missões seja idêntico — usamos um
 * hash combinando (user_id, dia ISO) como seed do RNG.
 *
 * As missões ficam persistidas em `daily_missions(user_id, day, missions)`
 * (JSONB). Idempotente: se já existir uma linha para (user, day), apenas
 * retorna ela. Se a tabela não existir, retorna a missão "in-memory" para
 * o componente UI (graceful fallback até a migration rodar).
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export type GoalType =
  | 'questions_total' // qualquer questão
  | 'questions_discipline' // questões de uma discipline
  | 'streak_consecutive' // acertos consecutivos numa discipline
  | 'simulado_finished' // simulados concluídos
  | 'subtopic_mastery' // subtópicos dominados hoje
  | 'focus_minutes'; // minutos focados (pomodoro)

export interface MissionTemplate {
  id: string;
  label: string;
  goalType: GoalType;
  goal: number;
  xpReward: number;
  discipline?: string;
}

export interface MissionState extends MissionTemplate {
  progress: number;
  completed: boolean;
  claimed: boolean;
}

const TEMPLATES: MissionTemplate[] = [
  { id: 'q10_bio', label: 'Resolva 10 questões de Biologia', goalType: 'questions_discipline', discipline: 'biologia', goal: 10, xpReward: 50 },
  { id: 'q10_mat', label: 'Resolva 10 questões de Matemática', goalType: 'questions_discipline', discipline: 'matematica', goal: 10, xpReward: 50 },
  { id: 'q10_qui', label: 'Resolva 10 questões de Química', goalType: 'questions_discipline', discipline: 'quimica', goal: 10, xpReward: 50 },
  { id: 'q10_fis', label: 'Resolva 10 questões de Física', goalType: 'questions_discipline', discipline: 'fisica', goal: 10, xpReward: 50 },
  { id: 'streak5_mat', label: 'Acerte 5 seguidas em Matemática', goalType: 'streak_consecutive', discipline: 'matematica', goal: 5, xpReward: 80 },
  { id: 'simulado1', label: 'Faça 1 simulado completo', goalType: 'simulado_finished', goal: 1, xpReward: 120 },
  { id: 'subtopic1', label: 'Domine 1 subtópico hoje', goalType: 'subtopic_mastery', goal: 1, xpReward: 100 },
  { id: 'focus25', label: 'Estude por 25 minutos no modo foco', goalType: 'focus_minutes', goal: 25, xpReward: 60 },
  { id: 'q20_total', label: 'Resolva 20 questões hoje', goalType: 'questions_total', goal: 20, xpReward: 70 },
  { id: 'q5_hum', label: 'Resolva 5 questões de Humanas', goalType: 'questions_discipline', discipline: 'humanas', goal: 5, xpReward: 30 },
];

// Hash determinístico simples — djb2 — combinando userId+day para a seed do PRNG.
function hashSeed(userId: string, day: string): number {
  const s = `${userId}|${day}`;
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h) ^ s.charCodeAt(i);
  }
  return h >>> 0;
}

// PRNG mulberry32 — pequeno, suficiente para sortear 3 índices.
function mulberry32(seed: number) {
  let a = seed;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickThree(userId: string, day: string): MissionTemplate[] {
  const rng = mulberry32(hashSeed(userId, day));
  const pool = [...TEMPLATES];
  const out: MissionTemplate[] = [];
  for (let i = 0; i < 3 && pool.length > 0; i++) {
    const idx = Math.floor(rng() * pool.length);
    const pick = pool[idx]!;
    out.push(pick);
    pool.splice(idx, 1);
  }
  return out;
}

function templateToState(t: MissionTemplate): MissionState {
  return { ...t, progress: 0, completed: false, claimed: false };
}

type UntypedClient = SupabaseClient;

export interface DailyMissions {
  day: string;
  missions: MissionState[];
}

export async function generateForUser(
  supabase: UntypedClient,
  userId: string,
  day: string,
): Promise<DailyMissions> {
  // Tenta ler missão existente
  try {
    const { data } = await supabase
      .from('daily_missions')
      .select('missions')
      .eq('user_id', userId)
      .eq('day', day)
      .maybeSingle();
    const row = (data as { missions: unknown } | null) ?? null;
    if (row && Array.isArray(row.missions)) {
      // Backfill defensivo de campos faltantes.
      const missions = (row.missions as Partial<MissionState>[]).map((m) => ({
        id: String(m.id ?? ''),
        label: String(m.label ?? ''),
        goalType: (m.goalType as GoalType) ?? 'questions_total',
        goal: Number(m.goal ?? 0),
        xpReward: Number(m.xpReward ?? 0),
        discipline: m.discipline,
        progress: Number(m.progress ?? 0),
        completed: Boolean(m.completed ?? false),
        claimed: Boolean(m.claimed ?? false),
      })) as MissionState[];
      if (missions.length > 0) {
        return { day, missions };
      }
    }
  } catch {
    // Tabela não existe — retorna in-memory.
    return { day, missions: pickThree(userId, day).map(templateToState) };
  }

  // Não existe — cria.
  const fresh = pickThree(userId, day).map(templateToState);
  try {
    await supabase
      .from('daily_missions')
      .upsert(
        { user_id: userId, day, missions: fresh },
        { onConflict: 'user_id,day', ignoreDuplicates: true },
      );
  } catch {
    /* segue com in-memory */
  }
  return { day, missions: fresh };
}
