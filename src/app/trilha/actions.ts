'use server';

/**
 * Server actions da Trilha RPG (PR 26).
 *
 * `startStationAndRedirect` valida que a estação está desbloqueada para o
 * user, monta uma sessão de quiz com N questões filtradas por discipline +
 * subtopic, marca `filters.trilha_station_id` na session e redireciona pra
 * `/quiz/sessao/[id]`.
 *
 * O cálculo de pass/fail é feito ao final da sessão (via `correct_count` /
 * `total_questions`) — a view `user_trilha_full_v2` reflete automaticamente.
 */
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import type { Json } from '@/lib/supabase/types';

const inputSchema = z.object({
  stationId: z.string().min(1).max(50),
});

export type StartStationResult =
  | { ok: true; sessionId: string }
  | { ok: false; error: string };

interface StationRow {
  id: string;
  rank: number | null;
  discipline: string | null;
  subtopic: string | null;
  is_boss: boolean;
  question_count: number;
  unlocks_after: string | null;
}

/**
 * Versão "função pura" que retorna o resultado em vez de redirect.
 * Útil pra testes; a versão exportada faz redirect.
 */
async function startStation(stationId: string): Promise<StartStationResult> {
  const parsed = inputSchema.safeParse({ stationId });
  if (!parsed.success) {
    return { ok: false, error: 'ID de estação inválido.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: 'Sessão expirada.' };
  }

  // 1) Carrega a estação.
  const { data: stationRaw, error: stErr } = await supabase
    .from('trilha_stations')
    .select('id, rank, discipline, subtopic, is_boss, question_count, unlocks_after')
    .eq('id', parsed.data.stationId)
    .maybeSingle();

  const station = stationRaw as StationRow | null;
  if (stErr || !station || station.rank == null) {
    return { ok: false, error: 'Estação não encontrada.' };
  }

  // 2) Valida unlock (consulta view que já calcula).
  // A view aplica RLS via security_invoker (auth.uid()).
  const { data: unlockRow } = await (supabase as unknown as {
    from: (t: string) => {
      select: (c: string) => {
        eq: (
          col: string,
          val: string,
        ) => {
          maybeSingle: () => Promise<{
            data: { id: string; is_unlocked: boolean } | null;
          }>;
        };
      };
    };
  })
    .from('user_trilha_full_v2')
    .select('id, is_unlocked')
    .eq('id', station.id)
    .maybeSingle();

  if (!unlockRow || !unlockRow.is_unlocked) {
    return { ok: false, error: 'Estação ainda bloqueada.' };
  }

  // 3) Monta pool de questões.
  let q = supabase
    .from('questions')
    .select('id')
    .eq('annulled', false)
    .limit(500);

  if (station.discipline) q = q.eq('discipline', station.discipline);
  if (station.subtopic) q = q.eq('subtopic', station.subtopic);

  const { data: pool, error: qErr } = await q;
  if (qErr || !pool || pool.length === 0) {
    return { ok: false, error: 'Sem questões disponíveis para esta estação.' };
  }

  // Shuffle Fisher-Yates.
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = shuffled[i];
    const b = shuffled[j];
    if (a && b) {
      shuffled[i] = b;
      shuffled[j] = a;
    }
  }

  const limited = shuffled.slice(0, station.question_count);
  const questionIds = limited.map((r) => r.id);

  // 4) Cria study_session com flag trilha_station_id nos filters.
  const filtersJson: Json = {
    trilha_station_id: station.id,
    discipline: station.discipline,
    subtopic: station.subtopic,
    mode: 'aleatorio',
    is_boss: station.is_boss,
    question_ids: questionIds,
  };

  const { data: created, error: insertErr } = await supabase
    .from('study_sessions')
    .insert({
      user_id: user.id,
      type: 'quiz',
      filters: filtersJson,
    })
    .select('id')
    .single();

  if (insertErr || !created) {
    return { ok: false, error: 'Falha ao criar sessão.' };
  }

  return { ok: true, sessionId: created.id };
}

export async function startStationAndRedirect(stationId: string): Promise<void> {
  const res = await startStation(stationId);
  if (!res.ok) {
    throw new Error(res.error);
  }
  redirect(`/quiz/sessao/${res.sessionId}`);
}
