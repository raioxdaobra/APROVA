/**
 * Grid de 4 cards grandes coloridos pros principais modos de estudo.
 *
 * Quiz / Simulado / Trilha / Revisão — cada um com sua cor accent
 * (mesma da sidebar) + ícone + número motivador.
 *
 * Server component — faz queries pra preencher os números reais.
 */
import Link from 'next/link';
import { Brain, Map as MapIcon, BarChart3, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import { fetchAll } from '@/lib/supabase/fetch-all';

interface ModeCardData {
  href: string;
  label: string;
  Icon: typeof Target;
  accentVar: string;
  highlight: string; // número grande (ex: "1015")
  caption: string; // linha explicativa pequena
}

export async function StudyModeCards({ userId }: { userId: string }) {
  const supabase = await createClient();

  // 1. Quiz: total de questões não-anuladas. Pagina pra contornar cap 1000 do PostgREST.
  const allQuestions = await fetchAll<{ id: string }>(({ from, to }) =>
    supabase
      .from('questions')
      .select('id')
      .eq('exam', 'unifor-medicina')
      .eq('annulled', false)
      .range(from, to),
  );
  const totalQuestions = allQuestions.length;

  // 2. Trilha: rank atual do user (mais alto desbloqueado).
  let currentRank = 1;
  try {
    type TrilhaRow = { user_completed: boolean; rank_id: string };
    type TrilhaQuery = {
      from: (table: string) => {
        select: (cols: string) => {
          eq: (
            col: string,
            val: string,
          ) => Promise<{ data: TrilhaRow[] | null }>;
        };
      };
    };
    const sb = supabase as unknown as TrilhaQuery;
    const { data } = await sb
      .from('user_trilha_full')
      .select('rank_id, user_completed')
      .eq('user_id', userId);
    if (data && data.length > 0) {
      const ranksWithProgress = new Set(
        data
          .filter((r) => r.user_completed)
          .map((r) => parseInt(r.rank_id?.replace(/\D/g, '') || '1', 10))
          .filter((n) => Number.isFinite(n) && n > 0),
      );
      const maxRank = ranksWithProgress.size > 0 ? Math.max(...ranksWithProgress) : 1;
      currentRank = Math.min(8, Math.max(1, maxRank));
    }
  } catch {
    // tabela pode não existir — fallback pro 1
  }

  // 3. Revisão: cards due hoje
  let dueToday = 0;
  try {
    const nowIso = new Date().toISOString();
    type FlashcardCount = { count: number | null };
    const res = (await supabase
      .from('flashcard_reviews' as never)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .lte('due_at', nowIso)) as unknown as FlashcardCount;
    dueToday = res.count ?? 0;
  } catch {
    // tabela pode não existir
  }

  const cards: ModeCardData[] = [
    {
      href: '/quiz',
      label: 'Quiz',
      Icon: Target,
      accentVar: '--accent-quiz',
      highlight: `${totalQuestions}q`,
      caption: 'questões oficiais',
    },
    {
      href: '/simulado',
      label: 'Simulado',
      Icon: BarChart3,
      accentVar: '--accent-simulado',
      highlight: 'Real',
      caption: 'cronômetro + bônus',
    },
    {
      href: '/trilha',
      label: 'Trilha',
      Icon: MapIcon,
      accentVar: '--accent-trilha',
      highlight: `R${currentRank}/8`,
      caption: 'ranks da jornada',
    },
    {
      href: '/revisao',
      label: 'Revisão',
      Icon: Brain,
      accentVar: '--accent-chat',
      highlight: dueToday > 0 ? `${dueToday}` : '✓',
      caption: dueToday > 0 ? 'cards pra hoje' : 'em dia',
    },
  ];

  return (
    <section
      aria-label="Modos de estudo"
      className="grid grid-cols-2 gap-3 sm:grid-cols-4"
    >
      {cards.map((c) => (
        <ModeCard key={c.href} {...c} />
      ))}
    </section>
  );
}

function ModeCard({
  href,
  label,
  Icon,
  accentVar,
  highlight,
  caption,
}: ModeCardData) {
  return (
    <Link href={href} className="group block">
      <Card
        className="flex h-full flex-col items-start gap-3 border-l-4 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
        style={{
          borderLeftColor: `hsl(var(${accentVar}))`,
          backgroundColor: `hsl(var(${accentVar}) / 0.04)`,
        }}
      >
        <div className="flex w-full items-center justify-between">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            style={{
              backgroundColor: `hsl(var(${accentVar}) / 0.16)`,
              color: `hsl(var(${accentVar}))`,
            }}
            aria-hidden="true"
          >
            <Icon className="h-5 w-5" />
          </span>
          <span
            className="text-xl font-bold tabular-nums"
            style={{ color: `hsl(var(${accentVar}))` }}
          >
            {highlight}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-base font-semibold text-foreground">{label}</span>
          <span className="text-xs text-muted-foreground">{caption}</span>
        </div>
      </Card>
    </Link>
  );
}
