import Link from 'next/link';
import { AuthShell } from '@/components/auth/auth-shell';
import { SignUpForm } from './signup-form';

export const metadata = {
  title: 'Criar conta — APROVA',
};

export default function SignUpPage() {
  return (
    <AuthShell
      title="Crie sua conta"
      description="Sem custo. Sem anúncios. Você só precisa de um email."
      footer={
        <p>
          Cancela quando quiser · 7 dias garantidos
          <br />
          Feito em Fortaleza · 1.000+ questões oficiais Unifor
        </p>
      }
    >
      <SignUpForm />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Já tem conta?{' '}
        <Link
          href="/login"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Entrar
        </Link>
      </p>
    </AuthShell>
  );
}
