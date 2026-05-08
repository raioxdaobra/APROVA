import Link from 'next/link';
import { AuthShell } from '@/components/auth/auth-shell';
import { LoginForm } from './login-form';

export const metadata = {
  title: 'Entrar — APROVA',
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Bem-vindo de volta"
      description="Entre pra continuar de onde parou."
      footer={<p>Feito em Fortaleza · 1.000+ questões oficiais Unifor</p>}
    >
      <LoginForm />

      <div className="mt-6 flex flex-col items-center gap-3 text-sm">
        <Link
          href="/forgot-password"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Esqueci a senha
        </Link>
        <p className="text-muted-foreground">
          Não tem conta?{' '}
          <Link
            href="/signup"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Criar agora
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
