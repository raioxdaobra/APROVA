/**
 * Grid de 2 cards grandes coloridos pros 2 caminhos primários de estudo:
 * Resolver questões e Simulado.
 *
 * Stats por card sao "inerentes ao contexto" — Resolver questoes mostra
 * % acerto SO de quiz/revisao (sem simulado); Simulado mostra # de
 * simulados feitos + % acerto SO em context='simulado'.
 *
 * Server component — faz queries pra preencher os numeros reais e passa
 * pros componentes via props.
 */
import { createClient } from '@/lib/supabase/server';
import { fetchAll } from '@/lib/supabase/fetch-all';
import { ResolverQuestoesCard } from './resolver-questoes-card';
import { SimuladoCard } from './simulado-card';

export async function StudyModeCards({ userId }: { userId: string }) {
  const supabase = await createClient();

  // Stats por card — query em paralelo:
  // 1. Total de questões nao-anuladas (Unifor)
  // 2. Tentativas do user com context pra split por modo (excluindo diagnostico)
  // 3. Sessoes de simulado finalizadas pelo user (count)
  const [allQuestions, attemptsRes, simuladoCountRes] = await Promise.all([
    fetchAll<{ id: string }>(({ from, to }) =>
      supabase
        .from('questions')
        .select('id')
        .eq('exam', 'unifor-medicina')
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
    <section
      aria-label="Modos de estudo"
      className="grid grid-cols-1 gap-3 sm:grid-cols-2"
    >
      <ResolverQuestoesCard
        totalQuestions={totalQuestions}
        totalAnswered={quizAnswered}
        accuracyPct={quizAccuracyPct}
      />
      <SimuladoCard
        simuladosFeitos={simuladosFeitos}
        simuladoAccuracyPct={simuladoAccuracyPct}
      />
    </section>
  );
}
