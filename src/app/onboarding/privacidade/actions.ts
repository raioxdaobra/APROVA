'use server';

import { createClient } from '@/lib/supabase/server';

export type PrivacyState = {
  ok?: boolean;
  error?: string;
};

export async function submitPrivacy(
  _prev: PrivacyState,
  formData: FormData,
): Promise<PrivacyState> {
  const leaderboard = formData.get('leaderboard') === 'on';

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Sessão expirada.' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ is_public_in_leaderboard: leaderboard })
    .eq('id', user.id);

  if (error) {
    return { error: 'Não conseguimos salvar sua preferência. Tente de novo.' };
  }

  return { ok: true };
}
