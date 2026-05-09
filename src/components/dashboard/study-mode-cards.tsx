/**
 * Grid de 2 cards grandes coloridos pros 2 caminhos primários de estudo:
 * Resolver questões e Simulado.
 *
 * Card "Resolver questões": componentizado em <ResolverQuestoesCard />
 * (client) que abre um bottom-sheet com 3 modos (Bloco rápido / Por área /
 * Revisar erros), inspirado no respostaCerta.
 *
 * Card "Simulado": Link simples pra /simulado, server-side.
 *
 * Trilha e Revisão NÃO entram aqui — vivem só na sidebar.
 *
 * Server component — faz queries pra preencher os números reais e passa
 * pros componentes client via props.
 */
import Link from 'next/link';
import { BarChart3 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import { fetchAll } from '@/lib/supabase/fetch-all';
import { ResolverQuestoesCard } from './resolver-questoes-card';

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

  return (
    <section
      aria-label="Modos de estudo"
      className="grid grid-cols-1 gap-3 sm:grid-cols-2"
    >
      {/* Resolver questões — abre bottom-sheet com 3 modos (client component) */}
      <ResolverQuestoesCard totalQuestions={totalQuestions} />

      {/* Simulado — Link simples pra /simulado */}
      <Link href="/simulado" className="group block">
        <Card
          className="flex h-full flex-col gap-3 border-l-4 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
          style={{
            borderLeftColor: 'hsl(var(--accent-simulado))',
            backgroundColor: 'hsl(var(--accent-simulado) / 0.04)',
          }}
        >
          <div className="flex w-full items-center justify-between">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{
                backgroundColor: 'hsl(var(--accent-simulado) / 0.16)',
                color: 'hsl(var(--accent-simulado))',
              }}
              aria-hidden="true"
            >
              <BarChart3 className="h-5 w-5" />
            </span>
            <span
              className="text-xl font-bold tabular-nums"
              style={{ color: 'hsl(var(--accent-simulado))' }}
            >
              Real
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-base font-semibold text-foreground">Simulado</span>
            <span className="text-xs text-muted-foreground">
              Preparamos um simulado pra você com base no que mais cai
            </span>
          </div>
          <span
            className="mt-auto inline-flex items-center self-start rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              backgroundColor: 'hsl(var(--accent-simulado) / 0.16)',
              color: 'hsl(var(--accent-simulado))',
            }}
          >
            Iniciar simulado
          </span>
        </Card>
      </Link>
    </section>
  );
}
