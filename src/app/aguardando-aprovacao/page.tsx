import { redirect } from 'next/navigation';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { logout } from '@/app/dashboard/actions';

export const metadata = {
  title: 'Conta em análise — APROVA',
};

export const dynamic = 'force-dynamic';

export default async function AguardandoAprovacaoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/');
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 px-4 py-10 text-center">
      <h1 className="text-3xl font-semibold tracking-tight text-primary">APROVA</h1>
      <Card className="w-full">
        <CardTitle className="mb-2">Sua conta está em análise</CardTitle>
        <CardDescription className="text-sm">
          Você receberá um aviso por email quando for aprovada. Obrigado por se cadastrar.
        </CardDescription>
      </Card>
      <form action={logout} className="w-full">
        <Button type="submit" size="lg" variant="secondary" className="w-full">
          Sair
        </Button>
      </form>
    </main>
  );
}
