import { OnboardingStepper } from '@/components/onboarding-stepper';
import { PerfilForm } from './perfil-form';

export const metadata = {
  title: 'Escolha seu username — APROVA',
};

export default function OnboardingPerfilPage() {
  return (
    <>
      <OnboardingStepper current={1} />
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-foreground">Como você quer aparecer?</h1>
        <p className="text-sm text-muted-foreground">
          Esse é o nome que outros estudantes vão ver no ranking semanal. Pode usar letras
          minúsculas, números e _.
        </p>
      </header>
      <PerfilForm />
    </>
  );
}
