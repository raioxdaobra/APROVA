import Link from 'next/link';
import { redirect } from 'next/navigation';
import { BackButton } from '@/components/back-button';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { getPlanInfo } from '@/lib/billing/caps';
import { formatBRL, PRICE_ANNUAL_BRL, PRICE_MONTHLY_BRL } from '@/lib/billing/prices';
import { SignOutForm } from '@/app/configuracoes/forms/sign-out-form';
import { UpgradeButton } from './upgrade-button';

export const metadata = {
  title: 'Conta — APROVA',
};

export const dynamic = 'force-dynamic';

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function diffDays(target: string | null | undefined): number {
  if (!target) return 0;
  const t = Date.parse(target);
  if (Number.isNaN(t)) return 0;
  const ms = t - Date.now();
  if (ms <= 0) return 0;
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

interface Initials {
  text: string;
  bg: string;
}

function initialsFor(name: string): Initials {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const text = parts.length === 0
    ? '?'
    : parts.length === 1
      ? parts[0]!.slice(0, 2).toUpperCase()
      : (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
  // cor estável a partir do nome
  const palette = ['bg-primary', 'bg-emerald-500', 'bg-sky-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500'];
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return { text, bg: palette[h % palette.length]! };
}

export default async function ContaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, username, created_at')
    .eq('id', user.id)
    .maybeSingle();

  const displayName = profile?.display_name ?? '';
  const username = profile?.username ?? '';
  const email = user.email ?? '';
  const createdAt = profile?.created_at ?? user.created_at ?? null;

  const planInfo = await getPlanInfo(supabase, user.id);

  // Estatísticas
  const [{ count: questionsTotal }, { data: correctRows }, streakRow] = await Promise.all([
    supabase
      .from('attempts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id),
    supabase
      .from('attempts')
      .select('is_correct')
      .eq('user_id', user.id)
      .limit(10000),
    supabase
      .from('streaks')
      .select('current_streak')
      .eq('user_id', user.id)
      .maybeSingle(),
  ]);

  const totalAttempts = questionsTotal ?? 0;
  const correctCount = (correctRows ?? []).filter((r) => r.is_correct === true).length;
  const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;
  const daysOnPlatform = createdAt
    ? Math.max(1, Math.ceil((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
  const currentStreak = streakRow.data?.current_streak ?? 0;

  // Histórico de pagamentos: por enquanto não persistido (PR 31). Lista vazia.
  const paymentHistory: Array<{
    id: string;
    paid_at: string;
    amount: number;
    plan: string;
    status: string;
  }> = [];

  const trialDays = diffDays(planInfo.trialEndsAt);
  const initials = initialsFor(displayName || username || email);

  let planBadge: { label: string; tone: 'trial' | 'pro' | 'free' };
  if (planInfo.isPro) {
    planBadge = { label: 'Pro', tone: 'pro' };
  } else if (planInfo.isTrial) {
    planBadge = {
      label: trialDays === 1 ? 'Trial · 1 dia restante' : `Trial · ${trialDays} dias restantes`,
      tone: 'trial',
    };
  } else {
    planBadge = { label: 'Free (limites)', tone: 'free' };
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-2xl flex-col gap-3 px-4 py-6">
        <BackButton fallbackHref="/dashboard" className="self-start" />
        <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-foreground">Minha conta</h1>
        </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 pb-10">
        {/* Header do usuário */}
        <Card className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div
            aria-hidden
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-semibold text-white ${initials.bg}`}
          >
            {initials.text}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="truncate text-lg font-semibold text-foreground">{displayName || username || 'Usuário'}</p>
            <p className="truncate text-sm text-muted-foreground">{email}</p>
            {username ? (
              <p className="truncate text-xs text-muted-foreground">@{username}</p>
            ) : null}
          </div>
          <Button asChild variant="secondary" size="sm">
            <Link href="/configuracoes">Editar perfil</Link>
          </Button>
        </Card>

        {/* Plano atual */}
        <Card className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Plano atual</CardTitle>
              <CardDescription>Status da sua assinatura no APROVA.</CardDescription>
            </div>
            <span
              className={
                planBadge.tone === 'pro'
                  ? 'rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground'
                  : planBadge.tone === 'trial'
                    ? 'rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300'
                    : 'rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground'
              }
            >
              {planBadge.label}
            </span>
          </div>

          {planInfo.isPro ? (
            <div className="flex flex-col gap-2 text-sm">
              <p className="text-foreground">
                Acesso completo ativo
                {planInfo.planExpiresAt ? (
                  <>
                    {' até '}
                    <strong>{fmtDate(planInfo.planExpiresAt)}</strong>
                  </>
                ) : null}
                .
              </p>
              <UpgradeButton label="Renovar assinatura" />
            </div>
          ) : planInfo.isTrial ? (
            <div className="flex flex-col gap-2 text-sm">
              <p className="text-foreground">
                Trial Pro até <strong>{fmtDate(planInfo.trialEndsAt)}</strong>. Depois disso volta
                para o plano Free com limites.
              </p>
              <UpgradeButton label={`Assinar Pro · ${formatBRL(PRICE_MONTHLY_BRL)}/mês`} />
            </div>
          ) : (
            <div className="flex flex-col gap-2 text-sm">
              <p className="text-foreground">
                Você está no plano Free. Libere acesso ilimitado por
                {' '}
                <strong>{formatBRL(PRICE_MONTHLY_BRL)}/mês</strong> ou{' '}
                <strong>{formatBRL(PRICE_ANNUAL_BRL)}/ano</strong>.
              </p>
              <UpgradeButton label="Assinar Pro" />
            </div>
          )}
        </Card>

        {/* Estatística rápida */}
        <Card className="flex flex-col gap-3">
          <div>
            <CardTitle>Estatística rápida</CardTitle>
            <CardDescription>Resumo do seu progresso no APROVA.</CardDescription>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Questões resolvidas" value={String(totalAttempts)} />
            <Stat label="% acerto" value={`${accuracy}%`} />
            <Stat label="Dias na plataforma" value={String(daysOnPlatform)} />
            <Stat label="Streak atual" value={String(currentStreak)} />
          </div>
          <div>
            <Button asChild variant="secondary" size="sm">
              <Link href="/estatisticas">Ver estatísticas completas</Link>
            </Button>
          </div>
        </Card>

        {/* Histórico de pagamentos */}
        <Card className="flex flex-col gap-3">
          <div>
            <CardTitle>Histórico de pagamentos</CardTitle>
            <CardDescription>Cobranças realizadas via Mercado Pago.</CardDescription>
          </div>
          {paymentHistory.length === 0 ? (
            <p className="rounded border border-dashed border-border bg-muted/30 px-3 py-4 text-center text-sm text-muted-foreground">
              Nenhum pagamento registrado.
            </p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {paymentHistory.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-col gap-1 rounded border border-border bg-card px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="text-muted-foreground">{fmtDate(p.paid_at)}</span>
                  <span className="text-foreground">{p.plan}</span>
                  <span className="font-medium text-foreground">{formatBRL(p.amount)}</span>
                  <span className="text-xs text-muted-foreground">{p.status}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Métodos de pagamento */}
        <Card className="flex flex-col gap-2">
          <CardTitle>Métodos de pagamento</CardTitle>
          <CardDescription>
            O Mercado Pago processa cada pagamento direto na hora do checkout (PIX ou cartão), por
            isso o APROVA não armazena cartões salvos. Métodos recorrentes virão em breve.
          </CardDescription>
        </Card>

        {/* Sair */}
        <Card className="flex flex-col gap-3">
          <CardTitle>Sair</CardTitle>
          <CardDescription>Encerra sua sessão neste dispositivo.</CardDescription>
          <SignOutForm />
        </Card>
      </main>

      <footer className="mx-auto flex w-full max-w-2xl items-center justify-center gap-4 px-4 pb-6 text-xs text-muted-foreground">
        <Link href="/sobre" className="hover:underline">
          Sobre
        </Link>
        <Link href="/privacidade" className="hover:underline">
          Privacidade
        </Link>
        <Link href="/termos" className="hover:underline">
          Termos
        </Link>
      </footer>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded border border-border bg-card px-3 py-3">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="text-xl font-semibold text-foreground">{value}</span>
    </div>
  );
}
