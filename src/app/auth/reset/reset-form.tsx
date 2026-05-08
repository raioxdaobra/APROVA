'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Loader2, Lock } from 'lucide-react';
import { AuthInput } from '@/components/auth/auth-input';
import { AuthCtaButton } from '@/components/auth/auth-cta-button';
import { createClient } from '@/lib/supabase/client';
import { updatePassword, type ResetPasswordState } from './actions';

const initialState: ResetPasswordState = {};

type SessionStatus = 'checking' | 'ready' | 'invalid';

export function ResetForm() {
  const [state, formAction] = useFormState(updatePassword, initialState);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('checking');

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    // O createBrowserClient do @supabase/ssr detecta o hash de recovery
    // (#access_token=...&type=recovery) automaticamente, troca por sessão
    // e seta os cookies. Aqui só verificamos se isso aconteceu.
    async function init() {
      // Pequeno delay para o supabase-js processar o hash da URL.
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;

      if (data.session) {
        // Limpa o hash da URL para não vazar o token no histórico.
        if (typeof window !== 'undefined' && window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
        setSessionStatus('ready');
        return;
      }

      // Sem sessão: pode ser que o link tenha expirado ou seja um acesso direto.
      setSessionStatus('invalid');
    }

    init();

    // Também escuta o evento PASSWORD_RECOVERY que o supabase-js dispara
    // quando processa o hash com sucesso.
    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        if (!cancelled) {
          if (typeof window !== 'undefined' && window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
          }
          setSessionStatus('ready');
        }
      }
    });

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, []);

  if (sessionStatus === 'checking') {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-sm text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span>Verificando link de recuperação...</span>
      </div>
    );
  }

  if (sessionStatus === 'invalid') {
    return (
      <div className="flex flex-col gap-4">
        <p
          role="alert"
          className="rounded border border-error bg-error-bg p-3 text-sm text-error-foreground"
        >
          Link de recuperação inválido ou expirado. Solicite um novo email.
        </p>
        <div className="flex flex-col items-center gap-2 text-sm">
          <Link
            href="/forgot-password"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Pedir novo link
          </Link>
          <Link
            href="/login"
            className="text-muted-foreground underline-offset-4 hover:underline"
          >
            Voltar para o login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <form action={formAction} className="flex flex-col gap-5" noValidate>
        <AuthInput
          id="password"
          name="password"
          type="password"
          label="Nova senha"
          autoComplete="new-password"
          placeholder="Pelo menos 8 caracteres"
          required
          minLength={8}
          icon={<Lock className="h-4 w-4" />}
          error={state.fieldErrors?.password}
        />
        <AuthInput
          id="confirm"
          name="confirm"
          type="password"
          label="Confirme a senha"
          autoComplete="new-password"
          placeholder="Repita a senha"
          required
          minLength={8}
          icon={<Lock className="h-4 w-4" />}
          error={state.fieldErrors?.confirm}
        />

        {state.error && (
          <p
            id="reset-error"
            role="alert"
            className="rounded border border-error bg-error-bg p-3 text-sm text-error-foreground"
          >
            {state.error}
          </p>
        )}

        <SubmitButton />
      </form>

      <div className="mt-6 flex flex-col items-center gap-2 text-sm">
        <Link
          href="/login"
          className="text-muted-foreground underline-offset-4 hover:underline"
        >
          Voltar para o login
        </Link>
      </div>
    </>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <AuthCtaButton
      type="submit"
      disabled={pending}
      rightIcon={pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
    >
      {pending ? 'Atualizando...' : 'Atualizar senha'}
    </AuthCtaButton>
  );
}
