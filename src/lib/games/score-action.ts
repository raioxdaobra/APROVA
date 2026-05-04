'use server';

/**
 * Server Action para submissão de scores dos mini-games (PR 13 / W5).
 *
 * Fluxo:
 *  1. Valida sessão (precisa estar logado).
 *  2. Insere linha em `game_scores`.
 *  3. Lê o leaderboard top 10 do jogo a partir da view `game_leaderboard`
 *     (que respeita `is_public_in_leaderboard`).
 *
 * Fail-soft: erros viram resposta neutra para que o jogo nunca quebre o
 * fluxo do usuário em caso de problema temporário.
 */

import { createClient } from '@/lib/supabase/server';
import type { GameId } from '@/lib/supabase/types';

export type { GameId };

export interface LeaderboardRow {
  username: string;
  display_name: string;
  best_score: number;
  plays: number;
  position: number;
}

export interface SubmitGameScoreResult {
  ok: boolean;
  best_score: number | null;
  is_new_best: boolean;
  leaderboard: LeaderboardRow[];
}

const EMPTY: SubmitGameScoreResult = {
  ok: false,
  best_score: null,
  is_new_best: false,
  leaderboard: [],
};

export async function submitGameScore(
  game_id: GameId,
  score: number,
  duration_sec: number,
  difficulty?: string,
): Promise<SubmitGameScoreResult> {
  try {
    const safeScore = Math.max(0, Math.floor(Number.isFinite(score) ? score : 0));
    const safeDuration = Math.max(
      0,
      Math.floor(Number.isFinite(duration_sec) ? duration_sec : 0),
    );

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return EMPTY;

    // Gate: só conta no ranking se o user atingiu 15min de foco hoje
    // (admin entra livre no jogo via gate-bypass na page, mas só pontua se cumpriu).
    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Fortaleza',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
    const { data: focusRow } = await supabase
      .from('daily_focus_minutes')
      .select('minutes')
      .eq('user_id', user.id)
      .eq('day', today)
      .maybeSingle();
    const focusMinutes = focusRow?.minutes ?? 0;
    const scoreCounts = focusMinutes >= 15;

    // Pega o melhor score atual antes do insert pra detectar new best.
    const { data: previousBest } = await supabase
      .from('game_scores')
      .select('score')
      .eq('user_id', user.id)
      .eq('game_id', game_id)
      .order('score', { ascending: false })
      .limit(1)
      .maybeSingle();

    const previousBestScore = (previousBest as { score: number } | null)?.score ?? -1;
    const isNewBest = scoreCounts && safeScore > previousBestScore;

    if (!scoreCounts) {
      // Score não persiste; só retorna leaderboard sem inserir (modo avaliação admin).
      const { data: lb } = await supabase
        .from('game_leaderboard')
        .select('username, display_name, best_score, plays, position')
        .eq('game_id', game_id)
        .order('position', { ascending: true })
        .limit(10);
      const leaderboard = (lb ?? []).map((row) => ({
        username: row.username,
        display_name: row.display_name,
        best_score: row.best_score,
        plays: row.plays,
        position: row.position,
      })) as LeaderboardRow[];
      return { ok: true, best_score: previousBestScore >= 0 ? previousBestScore : null, is_new_best: false, leaderboard };
    }

    const { error: insertError } = await supabase.from('game_scores').insert({
      user_id: user.id,
      game_id,
      score: safeScore,
      duration_sec: safeDuration,
      difficulty: difficulty ?? null,
    });

    if (insertError) {
      return EMPTY;
    }

    const { data: lb } = await supabase
      .from('game_leaderboard')
      .select('username, display_name, best_score, plays, position')
      .eq('game_id', game_id)
      .order('position', { ascending: true })
      .limit(10);

    const leaderboard = (lb ?? []).map((row) => ({
      username: row.username,
      display_name: row.display_name,
      best_score: row.best_score,
      plays: row.plays,
      position: row.position,
    })) as LeaderboardRow[];

    return {
      ok: true,
      best_score: Math.max(previousBestScore, safeScore),
      is_new_best: isNewBest,
      leaderboard,
    };
  } catch {
    return EMPTY;
  }
}

// ---------------------------------------------------------------------------
// Compat layer: a stub anterior (W6) expôs `submitScore({gameId, score, ...})`.
// Mantemos esse alias para não quebrar imports existentes durante a integração.
// ---------------------------------------------------------------------------

export interface SubmitScoreInput {
  gameId: GameId;
  score: number;
  durationMs?: number;
  meta?: Record<string, unknown>;
}

export interface SubmitScoreResult {
  ok: boolean;
  rank?: number;
  error?: string;
}

export async function submitScore(input: SubmitScoreInput): Promise<SubmitScoreResult> {
  const durationSec = input.durationMs ? Math.round(input.durationMs / 1000) : 0;
  const difficulty =
    typeof input.meta?.difficulty === 'string' ? (input.meta.difficulty as string) : undefined;
  const r = await submitGameScore(input.gameId, input.score, durationSec, difficulty);
  if (!r.ok) return { ok: false, error: 'submit_failed' };
  const me = r.leaderboard.find(() => false); // não temos username do user logado aqui
  return { ok: true, rank: me?.position };
}
