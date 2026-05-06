'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const schema = z.object({
  display_name: z.string().trim().min(1, 'Informe seu nome.').max(60, 'Máximo 60 caracteres.'),
  email: z.string().trim().email('Email inválido.'),
  password: z.string().min(8, 'Senha precisa de pelo menos 8 caracteres.'),
});

export type SignUpState = {
  error?: string;
  fieldErrors?: Partial<Record<'display_name' | 'email' | 'password', string>>;
};

export async function signUpWithEmail(
  _prev: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const parsed = schema.safeParse({
    display_name: formData.get('display_name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    const fieldErrors: SignUpState['fieldErrors'] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key === 'display_name' || key === 'email' || key === 'password') {
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
    }
    return { fieldErrors };
  }

  const hdrs = await headers();
  const host = hdrs.get('x-forwarded-host') ?? hdrs.get('host') ?? 'localhost:3000';
  const proto = hdrs.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  const origin = `${proto}://${host}`;

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.display_name },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    const code = (error as { code?: string }).code ?? '';
    const status = (error as { status?: number }).status ?? 0;
    if (code === 'user_already_exists' || status === 422) {
      return { error: 'Este email já tem conta. Use Entrar.' };
    }
    return { error: 'Não foi possível criar sua conta. Tente novamente.' };
  }

  redirect('/onboarding/perfil');
}
