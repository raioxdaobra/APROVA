/**
 * Avalia o progresso do usuário em estações da trilha. Deve ser chamado após
 * eventos relevantes (attempts gravados, simulado completo, mastery
 * desbloqueada, jogo finalizado, foco diário acumulado, diagnóstico
 * concluído, streak atualizado).
 *
 * Implementação conservadora: cada evento só toca as estações cujo
 * `goal_type` casa com o evento. O cálculo do progresso é stateless — lemos
 * a métrica acumulada do usuário no banco e gravamos em
 * `user_trilha_progress`. Estações já completas (completed=true) ficam
 * imutáveis para preservar o histórico.
 *
 * Esta função é tolerante a falhas: nenhum erro é propagado. Trilha não
 * deve quebrar fluxo crítico (responder questão, finalizar simulado).
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Discipline, TrilhaGoalType, Json } from '@/lib/supabase/types';

type SbClient = SupabaseClient<Database>;

export type TrilhaEvent =
  | { type: 'answer_questions'; discipline?: Discipline | null }
  | { type: 'answer_correct'; discipline?: Discipline | null }
  | { type: 'complete_simulado' }
  | { type: 'master_subtopics'; discipline?: Discipline | null }
  | { type: 'reach_streak'; current: number }
  | { type: 'complete_diagnostic' }
  | { type: 'play_game' }
  | { type: 'focus_minutes'; minutesToday: number };

interface StationRow {
  id: string;
  goal_type: TrilhaGoalType;
  goal_target: number;
  goal_filter: Json | null;
}

interface ProgressRow {
  station_id: string;
  progress: number;
  completed: boolean;
}

function readDisciplineFilter(filter: Json | null): string | null {
  if (!filter || typeof filter !== 'object' || Array.isArray(filter)) return null;
  const obj = filter as { [key: string]: Json | undefined };
  const d = obj.discipline;
  return typeof d === 'string' ? d : null;
}

function eventGoalType(event: TrilhaEvent): TrilhaGoalType {
  return event.type;
}

function stationMatchesEvent(station: StationRow, event: TrilhaEvent): boolean {
  if (station.goal_type !== eventGoalType(event)) return false;
  const filterDisc = readDisciplineFilter(station.goal_filter);
  if (!filterDisc) return true;
  // Se há filtro por disciplina na estação, evento precisa carregar disciplina compatível.
  if ('discipline' in event) {
    const d = event.discipline ?? null;
    return d === filterDisc;
  }
  return true;
}

/**
 * Calcula a métrica acumulada do usuário relevante ao goal_type da estação.
 * Retorna null se não foi possível medir (silencia o cálculo).
 */
async function measureMetric(
  sb: SbClient,
  userId: string,
  station: StationRow,
  event: TrilhaEvent,
): Promise<number | null> {
  const filterDisc = readDisciplineFilter(station.goal_filter);

  switch (station.goal_type) {
    case 'answer_questions': {
      let q = sb
        .from('attempts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .neq('context', 'diagnostic');
      if (filterDisc) {
        // Subselect via questions; usamos rpc simples: count via inner join não disponível direto
        // — fazemos count buscando ids de questions desta disciplina e filtrando attempts por essa lista.
        const { data: qids } = await sb
          .from('questions')
          .select('id')
          .eq('discipline', filterDisc)
          .limit(10000);
        const ids = (qids ?? []).map((r) => r.id);
        if (ids.length === 0) return 0;
        q = q.in('question_id', ids);
      }
      const { count, error } = await q;
      if (error) return null;
      return count ?? 0;
    }
    case 'answer_correct': {
      let q = sb
        .from('attempts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_correct', true)
        .neq('context', 'diagnostic');
      if (filterDisc) {
        const { data: qids } = await sb
          .from('questions')
          .select('id')
          .eq('discipline', filterDisc)
          .limit(10000);
        const ids = (qids ?? []).map((r) => r.id);
        if (ids.length === 0) return 0;
        q = q.in('question_id', ids);
      }
      const { count, error } = await q;
      if (error) return null;
      return count ?? 0;
    }
    case 'complete_simulado': {
      const { count, error } = await sb
        .from('study_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('type', 'simulado')
        .not('ended_at', 'is', null);
      if (error) return null;
      return count ?? 0;
    }
    case 'master_subtopics': {
      let q = sb
        .from('subtopic_mastery')
        .select('subtopic', { count: 'exact', head: true })
        .eq('user_id', userId);
      if (filterDisc) q = q.eq('discipline', filterDisc);
      const { count, error } = await q;
      if (error) return null;
      return count ?? 0;
    }
    case 'reach_streak': {
      if (event.type === 'reach_streak') {
        return Math.max(0, Math.floor(event.current));
      }
      const { data, error } = await sb
        .from('streaks')
        .select('current_streak, longest_streak')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) return null;
      return Math.max(data?.current_streak ?? 0, data?.longest_streak ?? 0);
    }
    case 'complete_diagnostic': {
      const { count, error } = await sb
        .from('study_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('type', 'diagnostic')
        .not('ended_at', 'is', null);
      if (error) return null;
      return count ?? 0;
    }
    case 'play_game': {
      const { count, error } = await sb
        .from('game_scores')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);
      if (error) return null;
      return count ?? 0;
    }
    case 'focus_minutes': {
      if (event.type === 'focus_minutes') {
        return Math.max(0, Math.floor(event.minutesToday));
      }
      // Lê o maior valor diário acumulado
      const { data, error } = await sb
        .from('daily_focus_minutes')
        .select('minutes')
        .eq('user_id', userId)
        .order('minutes', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) return null;
      return data?.minutes ?? 0;
    }
    default:
      return null;
  }
}

/**
 * Avalia todas as estações afetadas pelo evento e atualiza
 * `user_trilha_progress`. Estações já completas não são tocadas.
 *
 * Silencia falhas (loga em console.warn) — trilha não pode quebrar fluxos.
 */
export async function evaluateStationProgress(
  sb: SbClient,
  userId: string,
  event: TrilhaEvent,
): Promise<{ completedStationIds: string[] }> {
  const completedStationIds: string[] = [];

  try {
    const goalType = eventGoalType(event);
    const { data: stations, error: stErr } = await sb
      .from('trilha_stations')
      .select('id, goal_type, goal_target, goal_filter')
      .eq('goal_type', goalType);
    if (stErr || !stations) {
      return { completedStationIds };
    }

    const candidates = stations.filter((s) => stationMatchesEvent(s as StationRow, event));
    if (candidates.length === 0) return { completedStationIds };

    const ids = candidates.map((s) => s.id);
    const { data: existingProgress } = await sb
      .from('user_trilha_progress')
      .select('station_id, progress, completed')
      .eq('user_id', userId)
      .in('station_id', ids);

    const progressByStation = new Map<string, ProgressRow>();
    for (const row of existingProgress ?? []) {
      progressByStation.set(row.station_id, row as ProgressRow);
    }

    for (const station of candidates) {
      const prev = progressByStation.get(station.id);
      if (prev?.completed) continue;

      const measured = await measureMetric(sb, userId, station as StationRow, event);
      if (measured === null) continue;

      const target = station.goal_target;
      const newProgress = Math.min(measured, target);
      const justCompleted = newProgress >= target;

      const { error: upErr } = await sb.from('user_trilha_progress').upsert(
        {
          user_id: userId,
          station_id: station.id,
          progress: newProgress,
          completed: justCompleted,
          completed_at: justCompleted ? new Date().toISOString() : null,
        },
        { onConflict: 'user_id,station_id' },
      );
      if (upErr) continue;

      if (justCompleted && !prev?.completed) {
        completedStationIds.push(station.id);
      }
    }
  } catch (err) {
    console.warn('[trilha] evaluateStationProgress falhou:', err);
  }

  return { completedStationIds };
}
