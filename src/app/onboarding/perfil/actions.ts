'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const schema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Mínimo 3 caracteres.')
    .max(20, 'Máximo 20 caracteres.')
    .regex(/^[a-z0-9_]+$/, 'Use só letras minúsculas, números e _.'),
});

export type ProfileState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: { username?: string };
};

export async function submitProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const parsed = schema.safeParse({
    username: formData.get('username'),
  });

  if (!parsed.success) {
    const fieldErrors: ProfileState['fieldErrors'] = {};
    for (const issue of parsed.error.issues) {
      if (issue.path[0] === 'username' && !fieldErrors.username) {
        fieldErrors.username = issue.message;
      }
    }
    return { fieldErrors };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Sessão expirada.' };
  }

  const metadataDisplayName =
    typeof user.user_metadata?.display_name === 'string'
      ? user.user_metadata.display_name
      : undefined;
  const display_name = metadataDisplayName ?? user.email?.split('@')[0] ?? parsed.data.username;

  const { error: profileError } = await supabase.from('profiles').upsert(
    {
      id: user.id,
      username: parsed.data.username,
      display_name,
      daily_goal_questions: 20,
      is_public_in_leaderboard: true,
      onboarding_completed: false,
    },
    { onConflict: 'id' },
  );

  if (profileError) {
    const code = (profileError as { code?: string }).code ?? '';
    if (code === '23505') {
      return { error: 'Esse username acabou de ser pego. Tente outro.' };
    }
    return { error: 'Não conseguimos salvar seu perfil. Tente de novo.' };
  }

  // streaks é populada pela trigger fn_update_streak_on_attempt na primeira
  // attempt válida; INSERT direto não é permitido por RLS.

  return { ok: true };
}
