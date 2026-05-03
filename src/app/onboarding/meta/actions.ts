'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const schema = z.object({
  daily_goal: z.coerce.number().int().refine((v) => [10, 20, 40].includes(v), {
    message: 'Escolha 10, 20 ou 40 questões.',
  }),
});

export type MetaState = {
  ok?: boolean;
  error?: string;
};

export async function submitMeta(_prev: MetaState, formData: FormData): Promise<MetaState> {
  const parsed = schema.safeParse({
    daily_goal: formData.get('daily_goal'),
  });

  if (!parsed.success) {
    return { error: 'Escolha uma das opções para continuar.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Sessão expirada.' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ daily_goal_questions: parsed.data.daily_goal })
    .eq('id', user.id);

  if (error) {
    return { error: 'Não conseguimos salvar sua meta. Tente de novo.' };
  }

  return { ok: true };
}
