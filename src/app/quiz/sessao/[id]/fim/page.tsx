import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Fim de sessão — APROVA',
};

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
}

export default async function QuizSessionEndPage({ params }: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data: session, error: sessionErr } = await supabase
    .from('study_sessions')
    .select('id, user_id, type, started_at, ended_at, total_questions, correct_count, filters')
    .eq('id', params.id)
    .single();
  if (sessionErr || !session) redirect('/quiz');
  if (session.user_id !== user.id || session.type !== 'quiz') redirect('/quiz');
  if (!session.ended_at) {
    redirect(`/quiz/sessao/${params.id}`);
  }

  // Tentativas desta sessão
  const { data: attemptRows } = await supabase
    .from('attempts')
    .select('is_correct, answer')
    .eq('session_id', session.id)
    .eq('user_id', user.id);

  const attempts = attemptRows ?? [];
  const totalQuestions = session.total_questions ?? attempts.length;
  const correct = attempts.filter((a) => a.is_correct === true).length;
  const wrong = attempts.filter((a) => a.is_correct === false && a.answer !== null).length;
  const skipped = Math.max(0, totalQuestions - attempts.length);
  const aproveitamento =
    totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;

  // XP estimado (DB calcula real via trigger; aqui é apenas indicativo)
  const xpEarned = attempts.length * 10 + correct * 5;

  // Média histórica do usuário, excluindo esta sessão
  const { data: historicSessions } = await supabase
    .from('study_sessions')
    .select('total_questions, correct_count, ended_at')
    .eq('user_id', user.id)
    .eq('type', 'quiz')
    .not('ended_at', 'is', null)
    .neq('id', session.id);

  let historicAverage: number | null = null;
  if (historicSessions && historicSessions.length > 0) {
    let totalPct = 0;
    let counted = 0;
    for (const s of historicSessions) {
      const t = s.total_questions ?? 0;
      const c = s.correct_count ?? 0;
      if (t > 0) {
        totalPct += (c / t) * 100;
        counted += 1;
      }
    }
    if (counted > 0) {
      historicAverage = Math.round(totalPct / counted);
    }
  }

  const diff =
    historicAverage !== null ? aproveitamento - historicAverage : null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-4 py-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Sessão concluída</h1>
        <p className="text-sm text-muted-foreground">
          Veja como foi e mande mais uma sequência.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Acertos" value={String(correct)} valueClass="text-success" />
        <StatCard label="Erros" value={String(wrong)} valueClass="text-destructive" />
        <StatCard label="Pulou" value={String(skipped)} valueClass="text-muted-foreground" />
        <StatCard
          label="Aproveitamento"
          value={`${aproveitamento}%`}
          valueClass="text-foreground"
          large
        />
      </div>

      <Card className="flex flex-col gap-2">
        {diff === null ? (
          <p className="text-sm text-muted-foreground">
            Esta é sua primeira sessão registrada — vamos comparar a partir da próxima.
          </p>
        ) : (
          <p className="text-sm text-foreground">
            {diff === 0 ? (
              <span>Igual à sua média de {historicAverage}%.</span>
            ) : diff > 0 ? (
              <span>
                <span aria-hidden>↑ </span>
                {diff}% acima da sua média de {historicAverage}%.
              </span>
            ) : (
              <span>
                <span aria-hidden>↓ </span>
                {Math.abs(diff)}% abaixo da sua média de {historicAverage}%.
              </span>
            )}
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          XP estimado nesta sessão: <strong>+{xpEarned} XP</strong>
        </p>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button asChild size="lg" className="w-full">
          <Link href="/quiz">Nova sessão</Link>
        </Button>
        <Button asChild variant="secondary" size="lg" className="w-full">
          <Link href="/dashboard">Voltar para o início</Link>
        </Button>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  valueClass,
  large = false,
}: {
  label: string;
  value: string;
  valueClass?: string;
  large?: boolean;
}) {
  return (
    <Card className="flex flex-col items-center gap-1 p-4 text-center">
      <CardDescription className="text-xs uppercase tracking-wide">{label}</CardDescription>
      <CardTitle className={cn(large ? 'text-3xl' : 'text-2xl', valueClass)}>{value}</CardTitle>
    </Card>
  );
}
