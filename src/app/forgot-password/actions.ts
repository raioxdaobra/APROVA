'use server';

import { headers } from 'next/headers';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const schema = z.object({
  email: z.string().trim().email('Email inválido.'),
});

export type ForgotPasswordState = {
  success?: string;
  error?: string;
  fieldErrors?: Partial<Record<'email', string>>;
};

export async function requestPasswordReset(
  _prev: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const parsed = schema.safeParse({
    email: formData.get('email'),
  });

  if (!parsed.success) {
    const fieldErrors: ForgotPasswordState['fieldErrors'] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key === 'email' && !fieldErrors.email) {
        fieldErrors.email = issue.message;
      }
    }
    return { fieldErrors };
  }

  const hdrs = await headers();
  const host = hdrs.get('x-forwarded-host') ?? hdrs.get('host') ?? 'localhost:3000';
  const proto = hdrs.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  const origin = `${proto}://${host}`;

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/reset`,
  });

  // Não revelamos se o email existe ou não — sempre retornamos sucesso para
  // evitar enumeração de contas. Logs ficam só do lado do servidor.
  if (error) {
    // Erros transitórios reais (rate limit, infra) — devolvemos mensagem genérica.
    const status = (error as { status?: number }).status ?? 0;
    if (status === 429) {
      return { error: 'Muitas tentativas. Tente novamente em alguns minutos.' };
    }
  }

  return {
    success: 'Se este email tiver conta no APROVA, você receberá um link para redefinir a senha em instantes. Verifique também a pasta de spam.',
  };
}
