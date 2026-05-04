import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { FOCUS_GATE_MINUTES, GAMES, getGameMeta } from '../_lib/games-config';
import { GameLoader } from './_components/game-loader';

export const dynamic = 'force-dynamic';

const TZ = 'America/Fortaleza';

function fortalezaIsoDay(d = new Date()): string {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return fmt.format(d);
}

interface PageProps {
  params: { game: string };
}

export function generateStaticParams() {
  return GAMES.map((g) => ({ game: g.id }));
}

export async function generateMetadata({ params }: PageProps) {
  const meta = getGameMeta(params.game);
  return {
    title: meta ? `${meta.name} — APROVA` : 'Jogo — APROVA',
  };
}

export default async function GamePage({ params }: PageProps) {
  const meta = getGameMeta(params.game);
  if (!meta) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/');
  }

  // Gate: precisa ter ≥ FOCUS_GATE_MINUTES de foco hoje. Admins entram livres
  // (mas score só conta no ranking se atingiram o gate — tratado em submitScore).
  const day = fortalezaIsoDay();
  const [{ data: focusRow }, { data: profileRow }] = await Promise.all([
    supabase.from('daily_focus_minutes').select('minutes').eq('user_id', user.id).eq('day', day).maybeSingle(),
    supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle(),
  ]);
  const focusMinutes = focusRow?.minutes ?? 0;
  const isAdmin = profileRow?.is_admin === true;
  if (focusMinutes < FOCUS_GATE_MINUTES && !isAdmin) {
    redirect('/jogos');
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between gap-3 border-b border-border bg-card/80 px-4 py-3 backdrop-blur">
        <Link
          href="/jogos"
          className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden /> Sair
        </Link>
        <h1 className="text-base font-semibold text-foreground">{meta.name}</h1>
        <Link
          href={`/jogos/${meta.id}/ranking`}
          className="rounded px-2 py-1 text-sm text-primary hover:bg-muted"
        >
          Ranking
        </Link>
      </header>

      <main className="flex flex-1 items-stretch justify-center p-3 sm:p-6">
        <div className="flex w-full max-w-3xl flex-1 flex-col">
          <GameLoader gameId={meta.id} gameName={meta.name} />
        </div>
      </main>
    </div>
  );
}
