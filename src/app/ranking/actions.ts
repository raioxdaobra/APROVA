'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export type ToggleResult =
  | { ok: true; isPublic: boolean }
  | { ok: false; error: string };

export async function togglePublicLeaderboard(formData: FormData): Promise<ToggleResult> {
  const requested = formData.get('next');
  const next = requested === 'true' || requested === 'on';

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: 'Sessão expirada.' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ is_public_in_leaderboard: next })
    .eq('id', user.id);
  if (error) {
    return { ok: false, error: 'Falha ao atualizar preferência.' };
  }

  revalidatePath('/ranking');
  revalidatePath('/estatisticas');
  return { ok: true, isPublic: next };
}
