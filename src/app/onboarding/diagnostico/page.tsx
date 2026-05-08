import { Card } from '@/components/ui/card';
import { DiagnosticCTAs } from './diagnostic-ctas';

export const metadata = {
  title: 'Pronto pro diagnóstico? — APROVA',
};

export default function OnboardingDiagnosticoPage() {
  return (
    <>
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-foreground">Pronto pra começar?</h1>
        <p className="text-sm text-muted-foreground">
          Suas primeiras 5 questões — pra você sentir o app e a gente entender por onde
          começar. Leva uns 8 minutos.
        </p>
      </header>

      <Card className="border-2 border-primary">
        <p className="text-base font-semibold text-foreground">
          Antes de começar, uma observação importante.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          As questões aparecem no formato original da prova oficial — mesma diagramação, mesma
          tipografia, mesmo espaçamento. Você chega no dia do vestibular acostumado.
        </p>
      </Card>

      <DiagnosticCTAs />
    </>
  );
}
