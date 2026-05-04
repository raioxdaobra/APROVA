import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserMenu } from '@/components/user-menu';
import { Card } from '@/components/ui/card';
import { MarkdownKatex } from '@/components/markdown-katex';
import { createClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/slug';
import type { SupabaseClient } from '@supabase/supabase-js';
import { startSubtopicQuiz } from './start-action';

export const metadata = {
  title: 'Aprofundar — APROVA',
};

export const dynamic = 'force-dynamic';

type AnyDb = SupabaseClient;

const DISCIPLINE_LABEL: Record<string, string> = {
  matematica: 'Matemática',
  fisica: 'Física',
  quimica: 'Química',
  biologia: 'Biologia',
  humanas: 'Humanas',
  linguagens: 'Linguagens',
};

const VALID_DISCIPLINES = new Set(Object.keys(DISCIPLINE_LABEL));

interface PageProps {
  params: { discipline: string; subtopic: string };
}

interface TheoryLinkRow {
  title: string;
  url: string;
  source?: string;
}

function parseLinks(raw: unknown): TheoryLinkRow[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (l): l is { title: string; url: string; source?: string } =>
        Boolean(l) &&
        typeof l === 'object' &&
        typeof (l as { title?: unknown }).title === 'string' &&
        typeof (l as { url?: unknown }).url === 'string',
    )
    .map((l) => ({
      title: l.title,
      url: l.url,
      source: typeof l.source === 'string' ? l.source : undefined,
    }));
}

export default async function AprofundarPage({ params }: PageProps) {
  const discipline = decodeURIComponent(params.discipline);
  const subtopicSlug = decodeURIComponent(params.subtopic);

  if (!VALID_DISCIPLINES.has(discipline)) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/');
  }

  // Carrega todas as questões da disciplina; descobre o subtópico cujo slug bate.
  const { data: questionRows } = await supabase
    .from('questions')
    .select('id, discipline, subtopic, subtopic_short, year, semester, question_num, annulled')
    .eq('exam', 'unifor-medicina')
    .eq('discipline', discipline);

  const subtopicMap = new Map<
    string,
    { subtopic: string; subtopic_short: string; questionIds: string[] }
  >();
  for (const q of questionRows ?? []) {
    if (q.annulled) continue;
    const slug = slugify(q.subtopic_short || q.subtopic);
    const entry = subtopicMap.get(slug) ?? {
      subtopic: q.subtopic,
      subtopic_short: q.subtopic_short,
      questionIds: [],
    };
    entry.questionIds.push(q.id);
    subtopicMap.set(slug, entry);
  }

  const matched = subtopicMap.get(subtopicSlug);
  if (!matched) {
    notFound();
  }

  // 1) Resumo teórico + links
  const { data: theoryRow } = await (supabase as AnyDb)
    .from('subtopic_theory')
    .select('summary_md, links')
    .eq('discipline', discipline)
    .eq('subtopic', matched.subtopic)
    .maybeSingle();
  const theory = (theoryRow ?? null) as { summary_md: string; links: unknown } | null;
  const links = parseLinks(theory?.links);

  // 2) Profile (header)
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name, is_admin')
    .eq('id', user.id)
    .maybeSingle();
  const displayName = profile?.display_name ?? profile?.username ?? 'estudante';

  // 3) Tentativas do usuário neste subtópico — join manual (attempts + questions)
  const questionIdSet = new Set(matched.questionIds);
  const questionMetaById = new Map<
    string,
    { year: number; semester: number; question_num: number; subtopic_short: string }
  >();
  for (const q of questionRows ?? []) {
    if (q.discipline !== discipline) continue;
    questionMetaById.set(q.id, {
      year: q.year,
      semester: q.semester,
      question_num: q.question_num,
      subtopic_short: q.subtopic_short,
    });
  }

  const { data: attemptRows } = await supabase
    .from('attempts')
    .select('question_id, is_correct, answer, created_at, context')
    .eq('user_id', user.id)
    .neq('context', 'diagnostic')
    .in('question_id', matched.questionIds.length > 0 ? matched.questionIds : ['__none__']);

  // Mantém só a tentativa mais recente por questão.
  const latestByQuestion = new Map<
    string,
    { question_id: string; is_correct: boolean | null; answer: string | null; created_at: string | null }
  >();
  for (const a of attemptRows ?? []) {
    if (!questionIdSet.has(a.question_id)) continue;
    const prev = latestByQuestion.get(a.question_id);
    if (!prev) {
      latestByQuestion.set(a.question_id, a);
      continue;
    }
    const prevTs = prev.created_at ? Date.parse(prev.created_at) : 0;
    const currTs = a.created_at ? Date.parse(a.created_at) : 0;
    if (currTs >= prevTs) latestByQuestion.set(a.question_id, a);
  }

  const userAttempts = Array.from(latestByQuestion.values())
    .map((a) => {
      const meta = questionMetaById.get(a.question_id);
      return {
        question_id: a.question_id,
        is_correct: a.is_correct,
        answer: a.answer,
        created_at: a.created_at,
        year: meta?.year ?? 0,
        semester: meta?.semester ?? 0,
        question_num: meta?.question_num ?? 0,
      };
    })
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      if (a.semester !== b.semester) return b.semester - a.semester;
      return a.question_num - b.question_num;
    });

  const attemptsCorrect = userAttempts.filter((a) => a.is_correct === true).length;
  const totalQuestionsAvailable = matched.questionIds.length;
  const accuracyPct =
    userAttempts.length === 0
      ? null
      : Math.round((attemptsCorrect / userAttempts.length) * 100);

  const subtopicValue = matched.subtopic;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-3xl items-start justify-between gap-4 px-4 py-6">
        <div className="flex flex-col gap-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {DISCIPLINE_LABEL[discipline]}
          </p>
          <h1 className="text-2xl font-semibold text-foreground">
            {matched.subtopic_short || matched.subtopic}
          </h1>
          <p className="text-sm text-muted-foreground">
            {totalQuestionsAvailable} questões disponíveis
            {accuracyPct !== null
              ? ` · ${userAttempts.length} respondida${userAttempts.length === 1 ? '' : 's'} · ${accuracyPct}% acerto`
              : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu displayName={displayName} isAdmin={profile?.is_admin === true} />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 pb-12">
        <nav aria-label="Navegação" className="flex flex-wrap gap-2 text-sm">
          <Link
            href="/estatisticas"
            className="rounded border border-border bg-card px-3 py-1.5 hover:bg-muted"
          >
            ← Estatísticas
          </Link>
          <Link
            href="/dashboard"
            className="rounded border border-border bg-card px-3 py-1.5 hover:bg-muted"
          >
            Início
          </Link>
        </nav>

        {/* 1. Resumo teórico */}
        <section aria-labelledby="resumo-teorico" className="flex flex-col gap-3">
          <h2 id="resumo-teorico" className="text-lg font-semibold text-foreground">
            Resumo teórico
          </h2>
          <Card className="p-5">
            {theory?.summary_md ? (
              <MarkdownKatex>{theory.summary_md}</MarkdownKatex>
            ) : (
              <p className="text-sm text-muted-foreground">
                Resumo deste subtópico em preparação.
              </p>
            )}
          </Card>
        </section>

        {/* 2. Links externos */}
        <section aria-labelledby="links-externos" className="flex flex-col gap-3">
          <h2 id="links-externos" className="text-lg font-semibold text-foreground">
            Para se aprofundar
          </h2>
          <Card className="p-5">
            {links.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Sem links curados ainda para este subtópico.
              </p>
            ) : (
              <ul className="space-y-2">
                {links.map((l) => (
                  <li key={l.url} className="text-sm">
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline-offset-2 hover:underline"
                    >
                      {l.title}
                    </a>
                    {l.source ? (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({l.source})
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>

        {/* 3. Suas questões resolvidas */}
        <section aria-labelledby="suas-questoes" className="flex flex-col gap-3">
          <h2 id="suas-questoes" className="text-lg font-semibold text-foreground">
            Suas questões resolvidas
          </h2>
          <Card className="overflow-hidden p-0">
            {userAttempts.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">
                Você ainda não respondeu questões deste subtópico. Comece em
                "Praticar agora" abaixo.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-3 py-2 font-semibold">Prova</th>
                    <th className="px-3 py-2 font-semibold">Questão</th>
                    <th className="px-3 py-2 font-semibold">Sua resposta</th>
                    <th className="px-3 py-2 font-semibold">Resultado</th>
                    <th className="px-3 py-2 font-semibold" />
                  </tr>
                </thead>
                <tbody>
                  {userAttempts.map((a) => (
                    <tr key={a.question_id} className="border-b border-border last:border-0">
                      <td className="px-3 py-2 tabular-nums text-foreground">
                        {a.year}
                        {a.semester ? `.${a.semester}` : ''}
                      </td>
                      <td className="px-3 py-2 tabular-nums text-foreground">
                        #{a.question_num}
                      </td>
                      <td className="px-3 py-2 text-foreground">{a.answer ?? '—'}</td>
                      <td className="px-3 py-2">
                        {a.is_correct === true ? (
                          <span className="rounded-full bg-success-bg px-2 py-0.5 text-xs text-success">
                            acertou
                          </span>
                        ) : a.is_correct === false ? (
                          <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive">
                            errou
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Link
                          href={`/quiz?random=true`}
                          className="text-xs text-primary hover:underline"
                        >
                          rever
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </section>

        {/* 4. Praticar agora */}
        <section aria-labelledby="praticar" className="flex flex-col gap-3">
          <h2 id="praticar" className="text-lg font-semibold text-foreground">
            Praticar agora
          </h2>
          <Card className="flex flex-col gap-3 p-5">
            <p className="text-sm text-muted-foreground">
              Inicia uma sessão de quiz com até 10 questões aleatórias deste
              subtópico.
            </p>
            <form action={startSubtopicQuiz}>
              <input type="hidden" name="discipline" value={discipline} />
              <input type="hidden" name="subtopic" value={subtopicValue} />
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-base font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Começar 10 questões
              </button>
            </form>
          </Card>
        </section>
      </main>
    </div>
  );
}
