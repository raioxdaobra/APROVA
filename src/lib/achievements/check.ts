/**
 * Avaliação dos badges após cada attempt.
 *
 * `evaluateAfterAttempt` carrega contadores de leitura barata do user
 * (attempts total/diário, streak, mastery por discipline) e roda cada
 * `AchievementDefinition.check`. Insere os recém-desbloqueados em
 * `user_achievements` (on conflict do nothing). Retorna a lista de
 * badges novos (com metadados) para que o caller os exiba.
 *
 * As tabelas `achievements` / `user_achievements` são criadas pela
 * migration de gamificação (worktree A). Este código degrada
 * graciosamente caso elas ainda não existam — qualquer erro vira
 * lista vazia, sem derrubar o fluxo do quiz.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import {
  ACHIEVEMENTS,
  type AchievementContext,
  type AchievementDefinition,
} from './definitions';

const TZ = 'America/Fortaleza';

// Cliente "untyped" para tabelas que ainda não estão no Database typegen.
// Mantemos a API do supabase-js (from/select/insert) sem causar typecheck error.
type UntypedClient = SupabaseClient;

function fortalezaNow(): { hour: number; dayOfWeek: number; isoDay: string } {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    weekday: 'short',
    hour12: false,
  });
  const parts = fmt.formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const y = Number(get('year'));
  const m = Number(get('month'));
  const d = Number(get('day'));
  const hourStr = get('hour');
  const hour = Number(hourStr === '24' ? '0' : hourStr); // some locales return 24
  const wkMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const dayOfWeek = wkMap[get('weekday')] ?? 0;
  const isoDay = `${y.toString().padStart(4, '0')}-${m.toString().padStart(2, '0')}-${d
    .toString()
    .padStart(2, '0')}`;
  return { hour, dayOfWeek, isoDay };
}

interface CounterSnapshot {
  totalAttempts: number;
  dailyAttempts: number;
  currentStreak: number;
  dominions: string[];
  sundayCount: number;
  recoveryCount: number;
}

async function loadCounters(
  supabase: UntypedClient,
  userId: string,
  isoDay: string,
): Promise<CounterSnapshot> {
  const startOfDayIso = `${isoDay}T00:00:00-03:00`;

  const [totalRes, dailyRes, streakRes, masteryRes, sundaysRes] = await Promise.all([
    supabase
      .from('attempts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .neq('context', 'diagnostic'),
    supabase
      .from('attempts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .neq('context', 'diagnostic')
      .gte('created_at', startOfDayIso),
    supabase
      .from('streaks')
      .select('current_streak')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase
      .from('subtopic_mastery')
      .select('discipline')
      .eq('user_id', userId),
    supabase
      .from('attempts')
      .select('created_at')
      .eq('user_id', userId)
      .neq('context', 'diagnostic'),
  ]);

  const totalAttempts = totalRes.count ?? 0;
  const dailyAttempts = dailyRes.count ?? 0;
  const streakRow = (streakRes.data as { current_streak: number | null } | null) ?? null;
  const currentStreak = streakRow?.current_streak ?? 0;

  const masteryRows =
    (masteryRes.data as Array<{ discipline: string | null }> | null) ?? [];
  const dominions = Array.from(
    new Set(masteryRows.map((r) => r.discipline).filter((x): x is string => !!x)),
  );

  // Heurística simples de domingos com atividade + recovery
  const attempts =
    (sundaysRes.data as Array<{ created_at: string | null }> | null) ?? [];
  const days = new Set<string>();
  const sundayDays = new Set<string>();
  const sortedDayList: string[] = [];
  for (const a of attempts) {
    if (!a.created_at) continue;
    const fmt = new Intl.DateTimeFormat('en-CA', {
      timeZone: TZ,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short',
    });
    const parts = fmt.formatToParts(new Date(a.created_at));
    const day = `${parts.find((p) => p.type === 'year')?.value}-${
      parts.find((p) => p.type === 'month')?.value
    }-${parts.find((p) => p.type === 'day')?.value}`;
    if (!days.has(day)) {
      days.add(day);
      sortedDayList.push(day);
      const wd = parts.find((p) => p.type === 'weekday')?.value;
      if (wd === 'Sun') sundayDays.add(day);
    }
  }
  // recovery: gap >= 2 dias entre dias consecutivos com atividade
  sortedDayList.sort();
  let recoveryCount = 0;
  for (let i = 1; i < sortedDayList.length; i++) {
    const prev = sortedDayList[i - 1];
    const cur = sortedDayList[i];
    if (!prev || !cur) continue;
    const dPrev = new Date(prev + 'T00:00:00Z').getTime();
    const dCur = new Date(cur + 'T00:00:00Z').getTime();
    const diffDays = Math.round((dCur - dPrev) / 86_400_000);
    if (diffDays >= 2) recoveryCount += 1;
  }

  return {
    totalAttempts,
    dailyAttempts,
    currentStreak,
    dominions,
    sundayCount: sundayDays.size,
    recoveryCount,
  };
}

export interface UnlockedBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: AchievementDefinition['rarity'];
}

export async function evaluateAfterAttempt(
  supabase: UntypedClient,
  userId: string,
): Promise<UnlockedBadge[]> {
  const { hour, dayOfWeek, isoDay } = fortalezaNow();

  let counters: CounterSnapshot;
  try {
    counters = await loadCounters(supabase, userId, isoDay);
  } catch {
    return [];
  }

  const ctx: AchievementContext = {
    userId,
    hour,
    dayOfWeek,
    ...counters,
  };

  const candidates = ACHIEVEMENTS.filter((def) => {
    try {
      return def.check(ctx);
    } catch {
      return false;
    }
  });
  if (candidates.length === 0) return [];

  // Lê quais o user já tem para evitar inserts redundantes (e poder retornar
  // somente os "novos").
  let alreadyUnlocked: Set<string> = new Set();
  try {
    const { data } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId);
    const rows = (data as Array<{ achievement_id: string | null }> | null) ?? [];
    alreadyUnlocked = new Set(rows.map((r) => r.achievement_id).filter((x): x is string => !!x));
  } catch {
    // Tabela ainda não existe (migration pendente) — silenciosamente sai.
    return [];
  }

  const newOnes = candidates.filter((d) => !alreadyUnlocked.has(d.id));
  if (newOnes.length === 0) return [];

  const rows = newOnes.map((d) => ({
    user_id: userId,
    achievement_id: d.id,
  }));
  try {
    await supabase
      .from('user_achievements')
      .upsert(rows, { onConflict: 'user_id,achievement_id', ignoreDuplicates: true });
  } catch {
    return [];
  }

  return newOnes.map((d) => ({
    id: d.id,
    title: d.title,
    description: d.description,
    icon: d.icon,
    rarity: d.rarity,
  }));
}
