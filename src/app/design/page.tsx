import { BackButton } from '@/components/back-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';

const disciplines = [
  { name: 'Matemática', className: 'bg-discipline-matematica' },
  { name: 'Física', className: 'bg-discipline-fisica' },
  { name: 'Química', className: 'bg-discipline-quimica' },
  { name: 'Biologia', className: 'bg-discipline-biologia' },
  { name: 'Humanas', className: 'bg-discipline-humanas' },
  { name: 'Linguagens', className: 'bg-discipline-linguagens' },
];

const fontSizes = [
  { token: 'text-xs', label: '12px' },
  { token: 'text-sm', label: '14px' },
  { token: 'text-base', label: '16px' },
  { token: 'text-lg', label: '18px' },
  { token: 'text-xl', label: '20px' },
  { token: 'text-2xl', label: '24px' },
  { token: 'text-3xl', label: '28px' },
  { token: 'text-5xl', label: '48px' },
];

export const metadata = { title: 'Design System — APROVA' };

export default function DesignPage() {
  return (
    <main className="container max-w-4xl py-12">
      <div className="flex items-center justify-between">
        <BackButton fallbackHref="/" />
        <ThemeToggle />
      </div>

      <h1 className="mt-6 text-3xl font-semibold">Design System</h1>
      <p className="mt-2 text-base text-muted-foreground">
        Pré-visualização dos tokens definidos em{' '}
        <code className="font-mono text-sm">Design_Tokens_Aprova.md</code>.
      </p>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold">Cores</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Swatch label="primary" varName="--primary" />
          <Swatch label="primary-dark" varName="--primary-dark" />
          <Swatch label="primary-light" varName="--primary-light" />
          <Swatch label="page-bg" varName="--page-bg" />
          <Swatch label="card-bg" varName="--card-bg" />
          <Swatch label="border" varName="--border" />
          <Swatch label="text-primary" varName="--text-primary" />
          <Swatch label="text-secondary" varName="--text-secondary" />
          <Swatch label="success" varName="--success" />
          <Swatch label="error" varName="--error" />
          <Swatch label="warning" varName="--warning" />
        </div>

        <h3 className="mt-8 text-xl font-semibold">Disciplinas</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {disciplines.map((d) => (
            <span
              key={d.name}
              className={`rounded-sm px-3 py-0.5 text-xs font-semibold text-white ${d.className}`}
            >
              {d.name}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold">Tipografia</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Inter (sans) · JetBrains Mono (mono) · pesos 400 e 600.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          {fontSizes.map((f) => (
            <div key={f.token} className="flex items-baseline gap-4">
              <span className="w-24 font-mono text-xs text-muted-foreground">{f.token}</span>
              <span className={`${f.token} font-normal`}>The quick brown fox</span>
              <span className="text-xs text-muted-foreground">{f.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold">Botões</h2>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button variant="primary">Primário</Button>
          <Button variant="secondary">Secundário</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destrutivo</Button>
          <Button variant="primary" disabled>
            Desabilitado
          </Button>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold">Inputs</h2>
        <div className="mt-4 grid max-w-md gap-3">
          <Input placeholder="Digite seu email" />
          <Input placeholder="Desabilitado" disabled />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold">Cards</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Sequência atual</CardTitle>
              <CardDescription>Mantenha o ritmo</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-5xl font-semibold">7</p>
              <p className="mt-1 text-sm text-muted-foreground">dias seguidos</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Aproveitamento</CardTitle>
              <CardDescription>últimas 30 questões</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-5xl font-semibold text-success">68%</p>
              <p className="mt-1 text-sm text-muted-foreground">+5% acima da média</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold">Feedback semântico</h2>
        <div className="mt-4 grid gap-3">
          <div className="rounded border border-success bg-success-bg p-3 text-sm text-success-foreground">
            Correto! Gabarito: B (+15 XP)
          </div>
          <div className="rounded border border-error bg-error-bg p-3 text-sm text-error-foreground">
            Resposta certa: B. Você marcou D.
          </div>
          <div className="rounded border border-warning bg-warning-bg p-3 text-sm text-warning-foreground">
            Esta questão foi anulada pela banca — pontuação concedida a todos.
          </div>
        </div>
      </section>
    </main>
  );
}

function Swatch({ label, varName }: { label: string; varName: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="h-16 w-full" style={{ backgroundColor: `var(${varName})` }} />
      <div className="flex flex-col gap-0.5 p-3">
        <span className="font-mono text-xs">{label}</span>
        <span className="font-mono text-[10px] text-muted-foreground">{varName}</span>
      </div>
    </div>
  );
}
