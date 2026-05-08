'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const schema = z
  .object({
    password: z.string().min(8, 'Senha precisa de pelo menos 8 caracteres.'),
    confirm: z.string().min(1, 'Confirme a senha.'),
  })
  .refine((data) => data.password === data.confirm, {
    path: ['confirm'],
    message: 'As senhas não coincidem.',
  });

export type ResetPasswordState = {
  success?: string;
  error?: string;
  fieldErrors?: Partial<Record<'password' | 'confirm', string>>;
};

export async function updatePassword(
  _prev: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const parsed = schema.safeParse({
    password: formData.get('password'),
    confirm: formData.get('confirm'),
  });

  if (!parsed.success) {
    const fieldErrors: ResetPasswordState['fieldErrors'] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if ((key === 'password' || key === 'confirm') && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return { fieldErrors };
  }

  const supabase = await createClient();

  // Confere se há sessão (recovery foi reconhecida pelo cliente browser e
  // os cookies do @supabase/ssr foram setados).
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return {
      error: 'Link de recuperação expirou ou é inválido. Solicite um novo email.',
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    const status = (error as { status?: number }).status ?? 0;
    if (status === 422) {
      return { error: 'Senha inválida. Use pelo menos 8 caracteres.' };
    }
    return { error: 'Não foi possível atualizar sua senha. Tente novamente.' };
  }

  redirect('/');
}
