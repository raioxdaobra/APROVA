'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export type DeleteAllProgressResult =
  | { ok: true }
  | { ok: false; error: string };

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

  const tables = [
    'attempts',
    'study_sessions',
    'user_question_status',
    'weekly_xp',
    'streaks',
    'subtopic_mastery',
  ] as const;

  for (const table of tables) {
    const { error } = await supabase.from(table).delete().eq('user_id', user.id);
    if (error) {
      return { ok: false, error: `Falha ao limpar ${table}.` };
    }
  }

  revalidatePath('/estatisticas');
  revalidatePath('/dashboard');
  revalidatePath('/ranking');

  return { ok: true };
}
