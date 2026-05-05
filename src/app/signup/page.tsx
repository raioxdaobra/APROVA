import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuroraBackground } from '@/components/landing/aurora-background';
import { SignUpForm } from './signup-form';

export const metadata = {
  title: 'Criar conta — APROVA',
};

export default function SignUpPage() {
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
            <CardTitle>Criar conta</CardTitle>
            <CardDescription>
              Sem custo. Sem anúncios. Você só precisa de um email.
            </CardDescription>
          </CardHeader>
          <SignUpForm />
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Já tem conta?{' '}
            <Link href="/login" className="text-primary underline-offset-4 hover:underline">
              Entrar
            </Link>
          </p>
        </Card>
      </div>
    </main>
  );
}
