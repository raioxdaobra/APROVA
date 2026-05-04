import { Bot, Check, Trophy, Sparkles } from 'lucide-react';
import { ScrollReveal } from './scroll-reveal';
import { cn } from '@/lib/utils';

/**
 * Showcase com 3 cards mockup (questão, resolução IA, ranking).
 * Mockups são puros placeholders com SVG/CSS — sem dependência de imagens reais.
 */
export function ShowcaseSection() {
  return (
    <section className="container mx-auto max-w-6xl px-4 py-16 sm:py-24" aria-labelledby="showcase-title">
      <ScrollReveal className="mb-12 text-center">
        <h2
          id="showcase-title"
          className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
        >
          Tudo que você precisa em um só lugar
        </h2>
        <p className="mt-3 text-base text-muted-foreground">
          Da questão à resolução, da prática ao ranking. Sem distrações.
        </p>
      </ScrollReveal>

      <div className="grid gap-6 md:grid-cols-3">
        <ScrollReveal delay={0}>
          <MockCard title="Questão real">
            <QuestaoMock />
          </MockCard>
        </ScrollReveal>

        <ScrollReveal delay={120}>
          <MockCard title="IA explica" featured>
            <IAMock />
          </MockCard>
        </ScrollReveal>

        <ScrollReveal delay={240}>
          <MockCard title="Ranking ao vivo">
            <RankingMock />
          </MockCard>
        </ScrollReveal>
      </div>
    </section>
  );
}

function MockCard({
  title,
  children,
  featured,
}: {
  title: string;
  children: React.ReactNode;
  featured?: boolean;
}) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-card p-1 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg',
        featured ? 'border-primary/40 ring-1 ring-primary/20' : 'border-border',
      )}
    >
      {featured ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-px -z-0 rounded-xl bg-gradient-to-br from-primary/20 via-transparent to-primary/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
      ) : null}
      <div className="relative rounded-lg bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-error/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
          </div>
          <span className="text-xs font-medium text-muted-foreground">{title}</span>
          <span className="w-8" />
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

function QuestaoMock() {
  return (
    <div className="space-y-3 text-left text-xs">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-primary">Biologia</span>
        <span>Unifor 2024</span>
      </div>
      <p className="text-sm leading-relaxed text-foreground">
        A respiração celular ocorre principalmente em qual organela das células eucarióticas?
      </p>
      <ul className="space-y-2">
        {[
          { letra: 'A', texto: 'Núcleo', state: 'idle' },
          { letra: 'B', texto: 'Mitocôndria', state: 'correct' },
          { letra: 'C', texto: 'Ribossomo', state: 'idle' },
          { letra: 'D', texto: 'Lisossomo', state: 'idle' },
        ].map((item) => (
          <li
            key={item.letra}
            className={cn(
              'flex items-center gap-2 rounded-lg border px-3 py-2',
              item.state === 'correct'
                ? 'border-success/40 bg-success-bg text-success'
                : 'border-border',
            )}
          >
            <span
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold',
                item.state === 'correct'
                  ? 'border-success bg-success text-white'
                  : 'border-border text-muted-foreground',
              )}
            >
              {item.state === 'correct' ? <Check className="h-3 w-3" /> : item.letra}
            </span>
            <span>{item.texto}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function IAMock() {
  return (
    <div className="space-y-3 text-left text-xs">
      <div className="flex items-start gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <span className="text-[10px] font-bold">VC</span>
        </div>
        <div className="rounded-lg bg-muted px-3 py-2 text-foreground">
          Por que não pode ser ribossomo?
        </div>
      </div>
      <div className="flex items-start gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Bot className="h-3.5 w-3.5" aria-hidden="true" />
        </div>
        <div className="rounded-lg bg-primary/10 px-3 py-2 leading-relaxed text-foreground">
          Ribossomos sintetizam proteínas. A respiração celular acontece na{' '}
          <strong className="text-primary">mitocôndria</strong>, onde o ciclo de Krebs e a cadeia
          respiratória produzem ATP.
          <span className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
            <Sparkles className="h-3 w-3" aria-hidden="true" /> Resposta gerada em 1.2s
          </span>
        </div>
      </div>
    </div>
  );
}

function RankingMock() {
  const rows = [
    { pos: 1, name: 'Marina S.', xp: 14820, you: false },
    { pos: 2, name: 'Pedro L.', xp: 12440, you: false },
    { pos: 3, name: 'Você', xp: 11560, you: true },
    { pos: 4, name: 'Beatriz N.', xp: 10220, you: false },
    { pos: 5, name: 'Igor M.', xp: 9870, you: false },
  ];
  return (
    <div className="space-y-2 text-left text-xs">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          <Trophy className="h-3.5 w-3.5 text-warning" aria-hidden="true" /> Fortaleza
        </span>
        <span className="text-[10px] text-muted-foreground">Esta semana</span>
      </div>
      {rows.map((r) => (
        <div
          key={r.pos}
          className={cn(
            'flex items-center justify-between rounded-lg border px-3 py-2',
            r.you ? 'border-primary/40 bg-primary/5' : 'border-border',
          )}
        >
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold',
                r.pos === 1 && 'bg-warning text-white',
                r.pos === 2 && 'bg-neutral-500 text-white',
                r.pos === 3 && 'bg-primary text-primary-foreground',
                r.pos > 3 && 'bg-muted text-muted-foreground',
              )}
            >
              {r.pos}
            </span>
            <span className={cn('font-medium', r.you && 'text-primary')}>{r.name}</span>
          </div>
          <span className="font-mono text-[11px] text-muted-foreground">{r.xp.toLocaleString('pt-BR')} XP</span>
        </div>
      ))}
    </div>
  );
}
