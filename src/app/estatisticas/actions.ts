'use server';

import { revalidatePath } from 'next/cache';
import { createClient as createAdminClient, type SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

export type DeleteAllProgressResult =
  | { ok: true; deleted: Record<string, number> }
  | { ok: false; error: string };

/**
 * Cliente service_role pra bypassar RLS.
 *
 * Bug original: as policies RLS de `attempts`, `streaks`, `weekly_xp`,
 * `study_sessions`, `user_question_status` e `subtopic_mastery` só têm
 * SELECT/INSERT/UPDATE — NÃO TÊM DELETE. PostgREST então bloqueia o
 * delete silenciosamente (zero rows afetadas, sem erro). O action
 * retornava ok=true mas nada era apagado de fato.
 *
 * Solução: server-side só, usar service_role pra ignorar RLS. Como o user
 * já está autenticado e a action filtra por user.id, é seguro.
 */
function getAdminDb(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createAdminClient(url, key, { auth: { persistSession: false } });
}

export async function deleteAllProgress(
  formData: FormData,
): Promise<DeleteAllProgressResult> {
  // Confirmação simplificada (alinhada ao novo dialog "Zerar estatísticas"):
  // o user digita "Confirmo" — sem precisar lembrar o username.
  const confirmation = String(formData.get('confirmation') ?? '').trim().toLowerCase();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: 'Sessão expirada.' };
  }

  if (confirmation !== 'confirmo') {
    return { ok: false, error: 'Digite "Confirmo" pra prosseguir.' };
  }

  const admin = getAdminDb();
  if (!admin) {
    return { ok: false, error: 'Service role não configurado no servidor.' };
  }

  const tables = [
    'attempts',
    'study_sessions',
    'user_question_status',
    'weekly_xp',
    'streaks',
    'subtopic_mastery',
    'simulado_bonuses',
    'daily_xp',
    'flashcard_reviews',
  ] as const;

  const deleted: Record<string, number> = {};
  for (const table of tables) {
    // count: 'exact' retorna o número de linhas afetadas em `count`.
    const { error, count } = await admin
      .from(table)
      .delete({ count: 'exact' })
      .eq('user_id', user.id);
    if (error) {
      // Tabelas opcionais (ex: flashcard_reviews em DBs antigos) podem não
      // existir; ignoramos esse caso específico mas reportamos outros.
      const msg = error.message ?? '';
      if (msg.includes('does not exist') || msg.includes('relation')) {
        deleted[table] = 0;
        continue;
      }
      return { ok: false, error: `Falha ao limpar ${table}: ${msg}` };
    }
    deleted[table] = count ?? 0;
  }

  revalidatePath('/estatisticas');
  revalidatePath('/dashboard');
  revalidatePath('/ranking');
  revalidatePath('/conta');
  revalidatePath('/');

  return { ok: true, deleted };
}
