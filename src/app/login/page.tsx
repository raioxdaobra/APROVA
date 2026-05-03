import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from './login-form';

export const metadata = {
  title: 'Entrar — APROVA',
};

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Entrar</CardTitle>
          <CardDescription>Bem-vindo de volta.</CardDescription>
        </CardHeader>
        <LoginForm />
        <div className="mt-4 flex flex-col items-center gap-2 text-sm">
          <a
            href="mailto:eng.arocha@gmail.com?subject=Recuperar%20senha%20APROVA"
            className="text-muted-foreground underline-offset-4 hover:underline"
          >
            Esqueci a senha
          </a>
          <p className="text-muted-foreground">
            Não tem conta?{' '}
            <Link href="/signup" className="text-primary underline-offset-4 hover:underline">
              Criar agora
            </Link>
          </p>
        </div>
      </Card>
    </main>
  );
}
