import Link from 'next/link';
import { redirect } from 'next/navigation';
import { BackButton } from '@/components/back-button';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { createClient } from '@/lib/supabase/server';
import { DisplayNameForm } from './forms/display-name-form';
import { UsernameForm } from './forms/username-form';
import { ChangePasswordSection } from './forms/change-password-section';
import { DailyGoalForm } from './forms/daily-goal-form';
import { FavoriteDisciplineForm } from './forms/favorite-discipline-form';
import { PrivacyForm } from './forms/privacy-form';
import { DeleteAccountSection } from './forms/delete-account-section';
import { SignOutForm } from './forms/sign-out-form';
import { SoundToggle } from '@/components/sound-toggle';

export const metadata = {
  title: 'Configurações — APROVA',
};

export const dynamic = 'force-dynamic';

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select(
      'username, display_name, daily_goal_questions, is_public_in_leaderboard, favorite_discipline',
    )
    .eq('id', user.id)
    .maybeSingle();

  const displayName = profile?.display_name ?? '';
  const username = profile?.username ?? '';
  const dailyGoal = profile?.daily_goal_questions ?? 20;
  const leaderboardPublic = profile?.is_public_in_leaderboard ?? true;
  const favoriteDiscipline = profile?.favorite_discipline ?? null;
  const email = user.email ?? '';

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-2xl flex-col gap-3 px-4 py-6">
        <BackButton fallbackHref="/dashboard" className="self-start" />
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-foreground">Configurações</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 pb-10">
        <Card className="flex flex-col gap-5">
          <div>
            <CardTitle>Conta</CardTitle>
            <CardDescription>Seu perfil público e credenciais.</CardDescription>
          </div>
          <DisplayNameForm initial={displayName} />
          <UsernameForm initial={username} />
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-foreground">Email</span>
            <p className="rounded border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
              {email}
            </p>
          </div>
          <ChangePasswordSection />
        </Card>

        <Card className="flex flex-col gap-5">
          <div>
            <CardTitle>Estudo</CardTitle>
            <CardDescription>Defina seu ritmo e foco.</CardDescription>
          </div>
          <DailyGoalForm initial={dailyGoal} />
          <FavoriteDisciplineForm initial={favoriteDiscipline} />
        </Card>

        <Card className="flex flex-col gap-5">
          <div>
            <CardTitle>Privacidade</CardTitle>
            <CardDescription>Controle o que aparece para os outros.</CardDescription>
          </div>
          <PrivacyForm initial={leaderboardPublic} />
        </Card>

        <Card className="flex flex-col gap-5">
          <div>
            <CardTitle>Som</CardTitle>
            <CardDescription>
              Efeitos sonoros para acerto, erro, badge desbloqueado e level-up.
            </CardDescription>
          </div>
          <SoundToggle />
        </Card>

        <Card className="flex flex-col gap-3">
          <CardTitle>Notificações</CardTitle>
          <CardDescription>
            Em breve. Vai notificar você quando seu rival passar você no ranking, quando bater meta
            semanal, etc.
          </CardDescription>
        </Card>

        <Card className="flex flex-col gap-5">
          <div>
            <CardTitle>Zona de perigo</CardTitle>
            <CardDescription>
              Apague sua conta e todos os dados associados. Essa ação é definitiva.
            </CardDescription>
          </div>
          <DeleteAccountSection username={username} />
        </Card>

        <Card className="flex flex-col gap-3">
          <CardTitle>Sair</CardTitle>
          <CardDescription>Encerra sua sessão neste dispositivo.</CardDescription>
          <SignOutForm />
        </Card>
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
    </div>
  );
}
