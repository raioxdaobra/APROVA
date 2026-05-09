import Link from 'next/link';
import { redirect } from 'next/navigation';
import { RotateCw } from 'lucide-react';
import { BackButton } from '@/components/back-button';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import type { Discipline } from '@/lib/supabase/types';

export const metadata = {
  title: 'Revisar erros — APROVA',
};

export const dynamic = 'force-dynamic';

const DISCIPLINE_LABEL: Record<Discipline, string> = {
  matematica: 'Matemática',
  fisica: 'Física',
  quimica: 'Química',
  biologia: 'Biologia',
  humanas: 'Humanas',
  linguagens: 'Linguagens',
};

const DISCIPLINE_ACCENT: Record<Discipline, string> = {
  matematica: '--accent-quiz',
  fisica: '--accent-simulado',
  quimica: '--accent-trilha',
  biologia: '--accent-jogos',
  humanas: '--accent-ranking',
  linguagens: '--accent-chat',
};

interface AttemptRow {
  question_id: string;
  is_correct: boolean | null;
  created_at: string | null;
  context: string;
}

interface QuestionRow {
  id: string;
  discipline: string;
  annulled: boolean | null;
}

/**
 * Tela /revisar-erros — preview das questões erradas antes de iniciar
 * a sessão de revisão. Inspirada no padrão respostaCerta + nos cards
 * coloridos do APROVA.
 *
 * Fluxo:
 *   1. Mostra big number de erros + breakdown por disciplina
 *   2. CTA "Começar revisão" leva pra /quiz?status=wrong (que ja cria
 *      session com filtro wrong e redireciona)
 *
 * User pediu: ambiente intuitivo e leve com estatística do erro.
 */
export default async function RevisarErrosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/');

  // 1. Tentativas do user (excluindo diagnostico). Pegamos latest por
  //    question_id pra contar so questoes UNICAS erradas (nao toda tentativa).
  const { data: attempts } = await supabase
    .from('attempts')
    .select('question_id, is_correct, created_at, context')
    .eq('user_id', user.id)
    .neq('context', 'diagnostic');

  const latestByQuestion = new Map<string, AttemptRow>();
  for (const a of (attempts ?? []) as AttemptRow[]) {
    const prev = latestByQuestion.get(a.question_id);
    if (!prev) {
      latestByQuestion.set(a.question_id, a);
      continue;
    }
    const prevTs = prev.created_at ? Date.parse(prev.created_at) : 0;
    const currTs = a.created_at ? Date.parse(a.created_at) : 0;
    if (currTs >= prevTs) latestByQuestion.set(a.question_id, a);
  }

  const wrongQuestionIds = Array.from(latestByQuestion.entries())
    .filter(([, a]) => a.is_correct === false)
    .map(([qId]) => qId);

  const totalWrong = wrongQuestionIds.length;

  // 2. Pega disciplines das questoes erradas pra fazer breakdown.
  let byDiscipline: Map<string, number> = new Map();
  if (wrongQuestionIds.length > 0) {
    // Cap de 1000 do PostgREST: split em chunks de 500 ids por seguranca.
    const chunks: string[][] = [];
    for (let i = 0; i < wrongQuestionIds.length; i += 500) {
      chunks.push(wrongQuestionIds.slice(i, i + 500));
    }
    const allRows: QuestionRow[] = [];
    for (const chunk of chunks) {
      const { data } = await supabase
        .from('questions')
        .select('id, discipline, annulled')
        .in('id', chunk);
      if (data) allRows.push(...(data as QuestionRow[]));
    }
    for (const q of allRows) {
      if (q.annulled) continue;
      byDiscipline.set(q.discipline, (byDiscipline.get(q.discipline) ?? 0) + 1);
    }
  }

  const disciplineRows = Array.from(byDiscipline.entries())
    .map(([discipline, count]) => ({ discipline, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-6">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-lg shadow-sm"
            style={{
              backgroundColor: 'hsl(var(--success))',
              color: 'white',
            }}
            aria-hidden="true"
          >
            <RotateCw className="h-5 w-5" strokeWidth={2.25} />
          </span>
          <h1 className="text-2xl font-semibold text-foreground">Revisar erros</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Volte nas questões que você errou pra fortalecer o conteúdo. Cada
          questão aparece só uma vez (a tentativa mais recente conta).
        </p>
      </header>

      {totalWrong === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-10 text-center">
          <span aria-hidden="true" className="text-5xl">
            🎉
          </span>
          <h2 className="text-lg font-semibold text-foreground">
            Sem erros pra revisar
          </h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Você ainda não errou nenhuma questão (ou já corrigiu todas). Continue
            resolvendo questões pra montar seu plano de revisão.
          </p>
          <Button asChild size="lg">
            <Link href="/quiz">Resolver questões</Link>
          </Button>
        </Card>
      ) : (
        <>
          {/* Big number — quantas questões pra revisar */}
          <Card
            className="flex flex-col items-center gap-2 border-l-4 py-6 text-center"
            style={{
              borderLeftColor: 'hsl(var(--success))',
              backgroundColor: 'hsl(var(--success) / 0.04)',
            }}
          >
            <span
              className="text-5xl font-bold tabular-nums"
              style={{ color: 'hsl(var(--success))' }}
            >
              {totalWrong}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {totalWrong === 1 ? 'questão errada' : 'questões erradas'} pra
              revisar
            </span>
          </Card>

          {/* Breakdown por disciplina */}
          {disciplineRows.length > 0 ? (
            <section
              aria-labelledby="por-disciplina"
              className="flex flex-col gap-2"
            >
              <h2
                id="por-disciplina"
                className="text-sm font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Por disciplina
              </h2>
              <Card className="flex flex-col gap-2 p-4">
                <ul className="flex flex-col gap-2">
                  {disciplineRows.map((row) => {
                    const label =
                      DISCIPLINE_LABEL[row.discipline as Discipline] ??
                      row.discipline;
                    const accentVar =
                      DISCIPLINE_ACCENT[row.discipline as Discipline] ??
                      '--primary';
                    const pct =
                      totalWrong > 0
                        ? Math.round((row.count / totalWrong) * 100)
                        : 0;
                    return (
                      <li
                        key={row.discipline}
                        className="flex flex-col gap-1.5"
                      >
                        <div className="flex items-baseline justify-between gap-2 text-sm">
                          <span className="font-medium text-foreground">
                            {label}
                          </span>
                          <span className="tabular-nums text-muted-foreground">
                            <strong className="text-foreground">
                              {row.count}
                            </strong>{' '}
                            {row.count === 1 ? 'erro' : 'erros'}{' '}
                            <span className="text-xs">({pct}%)</span>
                          </span>
                        </div>
                        <div
                          className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
                          aria-hidden="true"
                        >
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: `hsl(var(${accentVar}))`,
                            }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            </section>
          ) : null}

          {/* CTA — começar revisão. Link pra /quiz?status=wrong que ja cria
              session aleatoria so com questoes erradas. */}
          <Button asChild size="lg" className="w-full text-base font-semibold">
            <Link href="/quiz?status=wrong">Começar revisão</Link>
          </Button>
        </>
      )}

      <BackButton fallbackHref="/dashboard" className="self-start" />
    </main>
  );
}
