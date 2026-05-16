'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getActiveExam } from '@/lib/exam/active-exam';
import type { Json } from '@/lib/supabase/types';

const MAX_QUIZ_QUESTIONS = 10;

const disciplineSchema = z.enum([
  'matematica',
  'fisica',
  'quimica',
  'biologia',
  'humanas',
  'linguagens',
]);

const inputSchema = z.object({
  discipline: disciplineSchema,
  subtopic: z.string().min(1),
});

export type StartSubtopicQuizInput = z.infer<typeof inputSchema>;

/**
 * Cria uma study_session do tipo "quiz" filtrada por (discipline, subtopic)
 * com até 10 questões aleatórias e redireciona para a sessão. Usada pelo botão
 * "Praticar agora" na página `/aprofundar/[discipline]/[subtopic]`.
 *
 * Aceita FormData (form action) ou um objeto digitado.
 */
export async function startSubtopicQuiz(
  input: StartSubtopicQuizInput | FormData,
): Promise<void> {
  const raw =
    input instanceof FormData
      ? {
          discipline: input.get('discipline'),
          subtopic: input.get('subtopic'),
        }
      : input;
  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error('Entrada inválida.');
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Sessão expirada.');
  }

  const { discipline, subtopic } = parsed.data;
  const exam = await getActiveExam(supabase, user.id);

  const { data: rows, error: qErr } = await supabase
    .from('questions')
    .select('id')
    .eq('exam', exam)
    .eq('discipline', discipline)
    .eq('subtopic', subtopic)
    .eq('annulled', false);
  if (qErr || !rows || rows.length === 0) {
    throw new Error('Nenhuma questão encontrada para este subtópico.');
  }

  // Embaralha (Fisher-Yates) e limita a 10 questões.
  const pool = rows.map((r) => r.id);
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = pool[i];
    const b = pool[j];
    if (a && b) {
      pool[i] = b;
      pool[j] = a;
    }
  }
  const questionIds = pool.slice(0, MAX_QUIZ_QUESTIONS);

  const filtersJson: Json = {
    discipline,
    subtopic,
    year: null,
    status: 'todas',
    hide_annulled: true,
    mode: 'aleatorio',
    question_ids: questionIds,
    source: 'aprofundar',
  };

  const { data: created, error: insertErr } = await supabase
    .from('study_sessions')
    .insert({
      user_id: user.id,
      type: 'quiz',
      filters: filtersJson,
    })
    .select('id')
    .single();
  if (insertErr || !created) {
    throw new Error('Falha ao criar sessão.');
  }

  redirect(`/quiz/sessao/${created.id}`);
}
