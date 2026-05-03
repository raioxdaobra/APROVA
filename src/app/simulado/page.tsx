import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { SimuladoSetupForm } from '@/components/simulado-setup-form';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Simulado — APROVA',
};

export const dynamic = 'force-dynamic';

export default async function SimuladoSetupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/');
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-4 py-6">
      <header className="flex flex-col gap-2">
        <Link
          href="/dashboard"
          className="text-xs font-medium text-muted-foreground hover:underline"
        >
          ← Voltar
        </Link>
        <h1 className="text-2xl font-semibold text-foreground">Simulado</h1>
        <p className="text-sm text-muted-foreground">
          Reproduz o formato da prova: tempo cronometrado, sem feedback durante a
          execução. O gabarito aparece só no final.
        </p>
      </header>

      <Card className="p-6">
        <SimuladoSetupForm />
      </Card>
    </main>
  );
}
