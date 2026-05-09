/**
 * Grid de 2 cards grandes coloridos pros 2 caminhos primários de estudo:
 * Resolver questões e Simulado. Cada um com cor accent (mesma da sidebar)
 * + ícone + número motivador + CTA explícito.
 *
 * Trilha e Revisão NÃO entram aqui — vivem só na sidebar. A regra é:
 * dashboard = entradas ativas pra começar a estudar; sidebar = navegação
 * geral. Sem duplicação.
 *
 * O card "Resolver questões" tem um botão secundário "Revisar erros" pra
 * filtrar direto questões erradas.
 *
 * Server component — faz queries pra preencher os números reais.
 */
import Link from 'next/link';
import { BarChart3, Target } from 'lucide-react';
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
  cta: string; // texto do botão CTA (ex: "Começar agora")
  /** Link secundário opcional (ex: "Revisar erros" no card de questões). */
  secondary?: { href: string; label: string };
}

export async function StudyModeCards({ userId: _userId }: { userId: string }) {
  const supabase = await createClient();

  // Total de questões não-anuladas. Pagina pra contornar cap 1000 do PostgREST.
  const allQuestions = await fetchAll<{ id: string }>(({ from, to }) =>
    supabase
      .from('questions')
      .select('id')
      .eq('exam', 'unifor-medicina')
      .eq('annulled', false)
      .range(from, to),
  );
  const totalQuestions = allQuestions.length;

  const cards: ModeCardData[] = [
    {
      href: '/quiz',
      label: 'Resolver questões',
      Icon: Target,
      accentVar: '--accent-quiz',
      highlight: `${totalQuestions}q`,
      caption: 'Resolva questões por área de interesse',
      cta: 'Começar agora',
      secondary: { href: '/quiz?status=wrong', label: 'Revisar erros' },
    },
    {
      href: '/simulado',
      label: 'Simulado',
      Icon: BarChart3,
      accentVar: '--accent-simulado',
      highlight: 'Real',
      caption: 'Preparamos um simulado pra você com base no que mais cai',
      cta: 'Iniciar simulado',
    },
  ];

  return (
    <section
      aria-label="Modos de estudo"
      className="grid grid-cols-1 gap-3 sm:grid-cols-2"
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
  cta,
  secondary,
}: ModeCardData) {
  return (
    <Card
      className="flex h-full flex-col gap-3 border-l-4 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
      style={{
        borderLeftColor: `hsl(var(${accentVar}))`,
        backgroundColor: `hsl(var(${accentVar}) / 0.04)`,
      }}
    >
      <Link href={href} className="group flex flex-1 flex-col gap-3 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md">
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
        {/* CTA explícito — pílula visualmente distinta pra ficar claro que da pra clicar.
            Sem seta: user pediu visual mais limpo. */}
        <span
          className="mt-auto inline-flex items-center self-start rounded-full px-3 py-1 text-xs font-semibold"
          style={{
            backgroundColor: `hsl(var(${accentVar}) / 0.16)`,
            color: `hsl(var(${accentVar}))`,
          }}
        >
          {cta}
        </span>
      </Link>
      {secondary ? (
        <Link
          href={secondary.href}
          className="self-start text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          {secondary.label}
        </Link>
      ) : null}
    </Card>
  );
}
