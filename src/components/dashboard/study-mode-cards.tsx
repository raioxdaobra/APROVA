/**
 * Grid de 2 cards grandes coloridos pros 2 caminhos primários de estudo:
 * Resolver questões e Simulado.
 *
 * Stats por card sao "inerentes ao contexto" — Resolver questoes mostra
 * % acerto SO de quiz/revisao (sem simulado); Simulado mostra # de
 * simulados feitos + % acerto SO em context='simulado'.
 *
 * Acima dos cards renderizamos uma "barra de atalhos" horizontal alinhada
 * a direita com 3 icones: Estatisticas, Ranking, Revisao. Antes esses
 * icones viviam DENTRO de cada card e levavam pra paginas filtradas por
 * contexto (?context=quiz | ?context=simulado). User pediu pra unificar:
 * agora um clique vai pra pagina compilada (sem filtro), com dados de
 * todas as modalidades juntas.
 *
 * Server component — faz queries pra preencher os numeros reais e passa
 * pros componentes via props.
 */
import Link from 'next/link';
import { BarChart3, Brain, Trophy } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getActiveExam } from '@/lib/exam/active-exam';
import { fetchAll } from '@/lib/supabase/fetch-all';
import { ResolverQuestoesCard } from './resolver-questoes-card';
import { SimuladoCard } from './simulado-card';

export async function StudyModeCards({ userId }: { userId: string }) {
  const supabase = await createClient();
  const exam = await getActiveExam(supabase, userId);

  // Stats por card — query em paralelo:
  // 1. Total de questões nao-anuladas (da prova ativa)
  // 2. Tentativas do user com context pra split por modo (excluindo diagnostico)
  // 3. Sessoes de simulado finalizadas pelo user (count)
  const [allQuestions, attemptsRes, simuladoCountRes] = await Promise.all([
    fetchAll<{ id: string }>(({ from, to }) =>
      supabase
        .from('questions')
        .select('id')
        .eq('exam', exam)
        .eq('annulled', false)
        .range(from, to),
    ),
    supabase
      .from('attempts')
      .select('is_correct, context')
      .eq('user_id', userId)
      .neq('context', 'diagnostic'),
    supabase
      .from('study_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('type', 'simulado')
      .not('ended_at', 'is', null),
  ]);

  const totalQuestions = allQuestions.length;
  const allAttempts = attemptsRes.data ?? [];

  // Stats de "Resolver questões" — so quiz/revisao/review (sem simulado).
  const quizAttempts = allAttempts.filter((a) => a.context !== 'simulado');
  const quizAnswered = quizAttempts.length;
  const quizCorrect = quizAttempts.filter((a) => a.is_correct === true).length;
  const quizAccuracyPct =
    quizAnswered === 0 ? null : Math.round((quizCorrect / quizAnswered) * 100);

  // Stats de "Simulado" — so context='simulado'.
  const simuladoAttempts = allAttempts.filter((a) => a.context === 'simulado');
  const simuladoAnswered = simuladoAttempts.length;
  const simuladoCorrect = simuladoAttempts.filter((a) => a.is_correct === true).length;
  const simuladoAccuracyPct =
    simuladoAnswered === 0 ? null : Math.round((simuladoCorrect / simuladoAnswered) * 100);
  const simuladosFeitos = simuladoCountRes.count ?? 0;

  return (
    <section aria-label="Modos de estudo" className="flex flex-col gap-3">
      {/* Barra de atalhos horizontal — alinhada a direita, acima do
          primeiro card. Compila stats de TODAS as modalidades (sem filtro
          de contexto). 3 icones grandes coloridos pra acesso rapido a
          Estatisticas, Ranking e Revisao. */}
      <div
        aria-label="Atalhos"
        className="flex items-center justify-end gap-2"
      >
        <Link
          href="/estatisticas"
          aria-label="Ver estatísticas"
          title="Estatísticas"
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          style={{
            backgroundColor: 'hsl(var(--accent-quiz))',
            color: 'white',
          }}
        >
          <BarChart3 className="h-5 w-5" aria-hidden="true" strokeWidth={2.25} />
        </Link>
        <Link
          href="/ranking"
          aria-label="Ver ranking"
          title="Ranking"
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          style={{
            backgroundColor: 'hsl(var(--accent-ranking))',
            color: 'white',
          }}
        >
          <Trophy className="h-5 w-5" aria-hidden="true" strokeWidth={2.25} />
        </Link>
        <Link
          href="/revisar-erros"
          aria-label="Revisar erros"
          title="Revisar erros"
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          style={{
            backgroundColor: 'hsl(var(--accent-chat))',
            color: 'white',
          }}
        >
          <Brain className="h-5 w-5" aria-hidden="true" strokeWidth={2.25} />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ResolverQuestoesCard
          totalQuestions={totalQuestions}
          totalAnswered={quizAnswered}
          accuracyPct={quizAccuracyPct}
        />
        <SimuladoCard
          simuladosFeitos={simuladosFeitos}
          simuladoAccuracyPct={simuladoAccuracyPct}
        />
      </div>
    </section>
  );
}
