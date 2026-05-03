'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import type { AnswerLetter } from '@/lib/supabase/types';

const answerLetterSchema = z.enum(['A', 'B', 'C', 'D', 'E']);

const clientAnswerSchema = z.object({
  question_id: z.string().min(1),
  answer: answerLetterSchema,
  time_spent_sec: z.number().int().nonnegative().max(60 * 60),
});

const finishSchema = z.object({
  sessionId: z.string().uuid(),
  answers: z.array(clientAnswerSchema).min(1).max(20),
});

export type FinishDiagnosticInput = z.infer<typeof finishSchema>;
export type FinishDiagnosticResult =
  | {
      ok: true;
      score: number;
      time_total_sec: number;
      results: Array<{ question_id: string; is_correct: boolean }>;
    }
  | { ok: false; error: string };

export async function finishDiagnostic(
  input: FinishDiagnosticInput,
): Promise<FinishDiagnosticResult> {
  const parsed = finishSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Payload inválido.' };
  }
  const { sessionId, answers } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: 'Sessão expirada.' };
  }

  // Validar que a sessão pertence ao usuário e ainda está aberta.
  const { data: session, error: sessionErr } = await supabase
    .from('study_sessions')
    .select('id, user_id, type, ended_at')
    .eq('id', sessionId)
    .single();
  if (sessionErr || !session) {
    return { ok: false, error: 'Sessão de diagnóstico não encontrada.' };
  }
  if (session.user_id !== user.id || session.type !== 'diagnostic') {
    return { ok: false, error: 'Sessão inválida.' };
  }

  // Buscar gabaritos das questões respondidas no banco — única fonte de verdade
  // para is_correct (não confiar em valores enviados pelo cliente).
  const questionIds = answers.map((a) => a.question_id);
  const { data: questionRows, error: qErr } = await supabase
    .from('questions')
    .select('id, correct_answer')
    .in('id', questionIds);
  if (qErr || !questionRows) {
    return { ok: false, error: 'Falha ao validar respostas.' };
  }
  const correctById = new Map<string, AnswerLetter | null>(
    questionRows.map((q) => [q.id, q.correct_answer]),
  );

  let correctCount = 0;
  let timeTotalSec = 0;
  const results: Array<{ question_id: string; is_correct: boolean }> = [];
  const attemptRows = answers.map((a) => {
    const correct = correctById.get(a.question_id) ?? null;
    const isCorrect = correct !== null && correct === a.answer;
    if (isCorrect) correctCount += 1;
    timeTotalSec += a.time_spent_sec;
    results.push({ question_id: a.question_id, is_correct: isCorrect });
    return {
      user_id: user.id,
      question_id: a.question_id,
      answer: a.answer,
      is_correct: isCorrect,
      time_spent_sec: a.time_spent_sec,
      context: 'diagnostic' as const,
      session_id: sessionId,
    };
  });

  const { error: insertErr } = await supabase.from('attempts').insert(attemptRows);
  if (insertErr) {
    return { ok: false, error: 'Falha ao salvar respostas.' };
  }

  const { error: updateErr } = await supabase
    .from('study_sessions')
    .update({
      ended_at: new Date().toISOString(),
      total_questions: answers.length,
      correct_count: correctCount,
      duration_sec: timeTotalSec,
    })
    .eq('id', sessionId);
  if (updateErr) {
    return { ok: false, error: 'Falha ao encerrar sessão.' };
  }

  const { error: profileErr } = await supabase
    .from('profiles')
    .update({ onboarding_completed: true })
    .eq('id', user.id);
  if (profileErr) {
    return { ok: false, error: 'Falha ao finalizar onboarding.' };
  }

  return {
    ok: true,
    score: correctCount,
    time_total_sec: timeTotalSec,
    results,
  };
}
