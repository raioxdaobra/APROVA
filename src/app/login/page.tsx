import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuroraBackground } from '@/components/landing/aurora-background';
import { LoginForm } from './login-form';

export const metadata = {
  title: 'Entrar — APROVA',
};

export default function LoginPage() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden">
      <AuroraBackground className="-z-10 opacity-[0.07] dark:opacity-[0.12]" />
      <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4 py-10">
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="inline-block text-2xl font-semibold tracking-tight text-primary"
          >
            APROVA
          </Link>
        </div>
        <Card className="border-border/60 shadow-[0_24px_60px_-20px_rgba(196,99,59,0.25)] backdrop-blur-sm">
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
      </div>
    </main>
  );
}
