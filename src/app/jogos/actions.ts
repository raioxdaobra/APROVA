'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const TZ = 'America/Fortaleza';

function fortalezaIsoDay(d = new Date()): string {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return fmt.format(d);
}

const incrementSchema = z.object({
  minutes: z.number().int().min(1).max(120),
});

export interface IncrementFocusResult {
  ok: boolean;
  totalToday: number;
  error?: string;
}

/**
 * Incrementa `daily_focus_minutes` do usuário autenticado para o dia atual
 * (em America/Fortaleza). Cria o row se não existir. Retorna o total acumulado
 * do dia para o cliente atualizar UI.
 */
export async function incrementFocusMinutes(
  minutes: number,
): Promise<IncrementFocusResult> {
  const parsed = incrementSchema.safeParse({ minutes });
  if (!parsed.success) {
    return { ok: false, totalToday: 0, error: 'Valor inválido' };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, totalToday: 0, error: 'Não autenticado' };
  }

  const day = fortalezaIsoDay();

  // Lê o existente (se houver) e soma. Não temos RPC; upsert + increment via 2
  // queries é aceitável para um evento que dispara a cada 25 min.
  const { data: existing } = await supabase
    .from('daily_focus_minutes')
    .select('minutes')
    .eq('user_id', user.id)
    .eq('day', day)
    .maybeSingle();

  const nextMinutes = (existing?.minutes ?? 0) + parsed.data.minutes;

  const { error } = await supabase
    .from('daily_focus_minutes')
    .upsert(
      { user_id: user.id, day, minutes: nextMinutes },
      { onConflict: 'user_id,day' },
    );

  if (error) {
    return { ok: false, totalToday: existing?.minutes ?? 0, error: error.message };
  }
  return { ok: true, totalToday: nextMinutes };
}
