import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SignUpForm } from './signup-form';

export const metadata = {
  title: 'Criar conta — APROVA',
};

export default function SignUpPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4 py-10">
      <Card>
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
    </main>
  );
}
