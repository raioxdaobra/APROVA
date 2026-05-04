import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserMenu } from '@/components/user-menu';
import { TrilhaMap } from '@/components/trilha-map';
import { createClient } from '@/lib/supabase/server';
import type { Views } from '@/lib/supabase/types';

export const metadata = {
  title: 'Trilha — APROVA',
};

export const dynamic = 'force-dynamic';

const TZ = 'America/Fortaleza';

function fortalezaToday(): Date {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = fmt.format(new Date()).split('-').map(Number);
  const y = parts[0] ?? 1970;
  const m = parts[1] ?? 1;
  const d = parts[2] ?? 1;
  return new Date(Date.UTC(y, m - 1, d));
}

function startOfWeek(d: Date): Date {
  const day = d.getUTCDay();
  const offset = day === 0 ? -6 : 1 - day;
  const r = new Date(d);
  r.setUTCDate(r.getUTCDate() + offset);
  r.setUTCHours(0, 0, 0, 0);
  return r;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default async function TrilhaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/');
  }

  const today = fortalezaToday();
  const weekStartIso = isoDate(startOfWeek(today));

  const [profileRes, stationsRes, weeklyXpRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('display_name, username, is_admin')
      .eq('id', user.id)
      .maybeSingle(),
    supabase.from('user_trilha_full').select('*'),
    supabase
      .from('weekly_xp')
      .select('xp')
      .eq('user_id', user.id)
      .eq('week_start', weekStartIso)
      .maybeSingle(),
  ]);

  const profile = profileRes.data;
  const displayName = profile?.display_name ?? profile?.username ?? 'estudante';
  const stations = (stationsRes.data ?? []) as Views<'user_trilha_full'>[];
  const weeklyXp = weeklyXpRes.data?.xp ?? 0;

  const totalCompleted = stations.filter((s) => s.user_completed).length;
  const totalStations = stations.length;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-2xl items-start justify-between gap-4 px-4 py-6">
        <div className="flex flex-col gap-1">
          <Link
            href="/dashboard"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            ← Voltar ao dashboard
          </Link>
          <h1 className="text-2xl font-semibold text-foreground">Trilha de evolução</h1>
          <p className="text-sm text-muted-foreground">
            {totalCompleted} de {totalStations} estações concluídas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu displayName={displayName} isAdmin={profile?.is_admin === true} />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 pb-10">
        {totalStations === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Trilha ainda não populada. Rode <code className="font-mono text-xs">npm run gen:trilha</code> para
              criar as 40 estações.
            </p>
            <Button asChild variant="secondary" size="sm">
              <Link href="/dashboard">Voltar</Link>
            </Button>
          </div>
        ) : (
          <TrilhaMap stations={stations} weeklyXp={weeklyXp} />
        )}
      </main>
    </div>
  );
}
