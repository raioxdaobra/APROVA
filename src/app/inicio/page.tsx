import { redirect } from 'next/navigation';
import { BarChart3, Target, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserMenu } from '@/components/user-menu';
import { createClient } from '@/lib/supabase/server';
import { setActiveExam } from './actions';

export const metadata = {
  title: 'Início — APROVA',
};

export const dynamic = 'force-dynamic';

/**
 * Tela inicial multi-vestibular. Mostra 3 cards (Unifor / ENEM / UECE) onde
 * o user escolhe qual prova vai estudar. Click no Unifor (ativa) seta
 * profiles.active_exam e manda pro dashboard. ENEM/UECE estão "em breve" —
 * Fase 1 só renderiza desabilitado; Fase 3 vai abrir tela de aviso com
 * lead capture.
 *
 * Spec: docs/superpowers/specs/2026-05-09-multi-vestibular-design.md
 */
export default async function InicioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, username, is_admin')
    .eq('id', user.id)
    .maybeSingle();
  const displayName = profile?.display_name ?? profile?.username ?? 'estudante';

  // Total de questões da Unifor (única prova ativa). Usa HEAD + count exato
  // pra evitar materializar todas as rows só pra contar — fast count vai
  // direto pelo Postgres em vez de paginar via PostgREST. /inicio sai de
  // ~800ms (paginação 1000 rows) pra <50ms.
  const { count: uniforCountRaw } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .eq('exam', 'unifor-medicina')
    .eq('annulled', false);
  const uniforCount = uniforCountRaw ?? 0;

  // Total de questões do ENEM. O card do ENEM só vira clicável quando há
  // questões no banco (count-gate): enquanto enemCount === 0 ele renderiza
  // "em breve" — comportamento idêntico ao de antes desta mudança. Quando o
  // seed importar as questões, o card ativa sozinho, sem novo deploy.
  const { count: enemCountRaw } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .eq('exam', 'enem')
    .eq('annulled', false);
  const enemCount = enemCountRaw ?? 0;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            APROVA
          </h1>
          <p className="text-sm text-muted-foreground">
            Olá, {displayName}. Escolha sua prova.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <UserMenu displayName={displayName} isAdmin={profile?.is_admin === true} />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 px-4 pb-10">
        <p className="text-sm text-muted-foreground">
          Cada prova tem seu próprio conteúdo, ranking e progresso. Você pode
          trocar a qualquer momento voltando aqui.
        </p>

        <section
          aria-label="Vestibulares disponíveis"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {/* Unifor — ATIVA */}
          <form action={setActiveExamUnifor}>
            <button
              type="submit"
              className="group block w-full text-left"
              aria-label={`Estudar Vestibular Medicina Unifor — ${uniforCount} questões`}
            >
              <Card
                className="flex h-full flex-col gap-3 border-l-4 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  borderLeftColor: 'hsl(var(--accent-quiz))',
                  backgroundColor: 'hsl(var(--accent-quiz) / 0.04)',
                }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{
                      backgroundColor: 'hsl(var(--accent-quiz) / 0.16)',
                      color: 'hsl(var(--accent-quiz))',
                    }}
                    aria-hidden="true"
                  >
                    <Target className="h-5 w-5" />
                  </span>
                  <span
                    className="rounded-full bg-success-bg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-success"
                  >
                    Disponível
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-base font-semibold text-foreground">
                    Vestibular Medicina Unifor
                  </span>
                  <span
                    className="text-sm font-semibold tabular-nums"
                    style={{ color: 'hsl(var(--accent-quiz))' }}
                  >
                    {uniforCount} questões oficiais
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Simulados, trilha gamificada e revisão com IA.
                  </span>
                </div>
                <span
                  className="mt-auto inline-flex items-center self-start rounded-full px-3 py-1 text-xs font-semibold"
                  style={{
                    backgroundColor: 'hsl(var(--accent-quiz) / 0.16)',
                    color: 'hsl(var(--accent-quiz))',
                  }}
                >
                  Estudar agora
                </span>
              </Card>
            </button>
          </form>

          {/* ENEM — count-gated: ativo quando há questões no banco, senão "em breve". */}
          {enemCount > 0 ? (
            <ExamActiveCard
              formAction={setActiveExamEnem}
              label="ENEM"
              questionCount={enemCount}
              description="Questões oficiais, simulado cronometrado e trilha gamificada."
              icon={<BarChart3 className="h-5 w-5" />}
              accentVar="--accent-simulado"
            />
          ) : (
            <ExamComingSoonCard
              label="ENEM"
              description="Questões oficiais dos últimos 10 anos, simulado cronometrado e trilha — em preparação."
              icon={<BarChart3 className="h-5 w-5" />}
              accentVar="--accent-simulado"
            />
          )}

          {/* UECE — EM BREVE */}
          <ExamComingSoonCard
            label="UECE"
            description="Vestibular UECE com questões oficiais e gabarito comentado — em preparação."
            icon={<Sparkles className="h-5 w-5" />}
            accentVar="--accent-trilha"
          />
        </section>

        <p className="mt-2 text-xs text-muted-foreground">
          Não encontrou sua prova? Mais vestibulares estão chegando — Unicristus, USP,
          UFC e outros. Avisaremos quando estiverem disponíveis.
        </p>
      </main>
    </div>
  );
}

/**
 * Wrapper sobre setActiveExam pra fechar o argumento "unifor-medicina" e
 * deixar o `<form action>` chamar sem precisar passar o nome da prova.
 * Necessário porque server actions de form só recebem FormData.
 */
async function setActiveExamUnifor() {
  'use server';
  await setActiveExam('unifor-medicina');
}

/** Mesmo wrapper de setActiveExamUnifor, fechado no argumento "enem". */
async function setActiveExamEnem() {
  'use server';
  await setActiveExam('enem');
}

interface ActiveCardProps {
  formAction: () => Promise<void>;
  label: string;
  questionCount: number;
  description: string;
  icon: React.ReactNode;
  accentVar: string;
}

/**
 * Card de prova ATIVA genérico. Usado por provas que não o Unifor (que tem
 * seu próprio bloco inline pra não ser alterado). Visualmente idêntico ao
 * card do Unifor: borda colorida, badge "Disponível", contagem de questões
 * e CTA "Estudar agora". Submete o form que seta profiles.active_exam.
 */
function ExamActiveCard({
  formAction,
  label,
  questionCount,
  description,
  icon,
  accentVar,
}: ActiveCardProps) {
  return (
    <form action={formAction}>
      <button
        type="submit"
        className="group block w-full text-left"
        aria-label={`Estudar ${label} — ${questionCount} questões`}
      >
        <Card
          className="flex h-full flex-col gap-3 border-l-4 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
          style={{
            borderLeftColor: `hsl(var(${accentVar}))`,
            backgroundColor: `hsl(var(${accentVar}) / 0.04)`,
          }}
        >
          <div className="flex items-center justify-between">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{
                backgroundColor: `hsl(var(${accentVar}) / 0.16)`,
                color: `hsl(var(${accentVar}))`,
              }}
              aria-hidden="true"
            >
              {icon}
            </span>
            <span className="rounded-full bg-success-bg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-success">
              Disponível
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-base font-semibold text-foreground">{label}</span>
            <span
              className="text-sm font-semibold tabular-nums"
              style={{ color: `hsl(var(${accentVar}))` }}
            >
              {questionCount} questões oficiais
            </span>
            <span className="text-xs text-muted-foreground">{description}</span>
          </div>
          <span
            className="mt-auto inline-flex items-center self-start rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              backgroundColor: `hsl(var(${accentVar}) / 0.16)`,
              color: `hsl(var(${accentVar}))`,
            }}
          >
            Estudar agora
          </span>
        </Card>
      </button>
    </form>
  );
}

interface ComingSoonProps {
  label: string;
  description: string;
  icon: React.ReactNode;
  accentVar: string;
}

/**
 * Card "em breve" da prova. Visualmente similar à ATIVA mas com badge
 * "Em breve" + opacidade reduzida. Em Fase 1 não é clicável; em Fase 3
 * vira <Link href="/inicio/[exam]"> com lead capture.
 */
function ExamComingSoonCard({ label, description, icon, accentVar }: ComingSoonProps) {
  return (
    <Card
      className="flex h-full cursor-not-allowed flex-col gap-3 border-l-4 p-5 opacity-70"
      style={{
        borderLeftColor: `hsl(var(${accentVar}))`,
        backgroundColor: `hsl(var(${accentVar}) / 0.04)`,
      }}
      aria-disabled="true"
    >
      <div className="flex items-center justify-between">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{
            backgroundColor: `hsl(var(${accentVar}) / 0.16)`,
            color: `hsl(var(${accentVar}))`,
          }}
          aria-hidden="true"
        >
          {icon}
        </span>
        <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          Em breve
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-base font-semibold text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </div>
      <span className="mt-auto inline-flex items-center self-start rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
        Aguarde lançamento
      </span>
    </Card>
  );
}
