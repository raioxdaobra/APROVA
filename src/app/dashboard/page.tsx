import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InstallPrompt } from '@/components/install-prompt';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserMenu } from '@/components/user-menu';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Dashboard — APROVA',
};

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, username')
    .eq('id', user.id)
    .maybeSingle();

  const { data: streak } = await supabase
    .from('streaks')
    .select('current_streak')
    .eq('user_id', user.id)
    .maybeSingle();

  const displayName = profile?.display_name ?? profile?.username ?? 'estudante';
  const currentStreak = streak?.current_streak ?? 0;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-2xl items-start justify-between gap-4 px-4 py-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-foreground">
            Olá, {displayName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {currentStreak === 0
              ? 'Comece sua sequência hoje'
              : `${currentStreak} ${currentStreak === 1 ? 'dia seguido' : 'dias seguidos'}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu displayName={displayName} />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 pb-10">
        <Card className="p-6">
          <CardHeader className="mb-2">
            <CardTitle>Em breve seu progresso aparece aqui.</CardTitle>
            <CardDescription>Estamos preparando o painel completo.</CardDescription>
          </CardHeader>
        </Card>

        <Button asChild size="lg" className="w-full">
          <Link href="/quiz?random=true">Resolver questões aleatórias</Link>
        </Button>
      </main>

      <footer className="mx-auto flex w-full max-w-2xl items-center justify-center gap-4 px-4 pb-6 text-xs text-muted-foreground">
        <Link href="/sobre" className="hover:underline">
          Sobre
        </Link>
        <Link href="/privacidade" className="hover:underline">
          Privacidade
        </Link>
        <Link href="/termos" className="hover:underline">
          Termos
        </Link>
      </footer>

      <InstallPrompt />
    </div>
  );
}
