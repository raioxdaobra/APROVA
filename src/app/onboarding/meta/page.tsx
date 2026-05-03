import { OnboardingStepper } from '@/components/onboarding-stepper';
import { MetaForm } from './meta-form';

export const metadata = {
  title: 'Sua meta diária — APROVA',
};

export default function OnboardingMetaPage() {
  return (
    <>
      <OnboardingStepper current={2} />
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-foreground">Quantas questões por dia?</h1>
        <p className="text-sm text-muted-foreground">
          Escolha um ritmo realista. Você pode mudar depois nas configurações.
        </p>
      </header>
      <MetaForm />
    </>
  );
}
