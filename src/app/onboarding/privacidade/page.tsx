import { OnboardingStepper } from '@/components/onboarding-stepper';
import { PrivacyForm } from './privacy-form';

export const metadata = {
  title: 'Privacidade — APROVA',
};

export default function OnboardingPrivacidadePage() {
  return (
    <>
      <OnboardingStepper current={3} />
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-foreground">Como você prefere aparecer?</h1>
        <p className="text-sm text-muted-foreground">
          Compartilhar sua posição no ranking ajuda a manter o ritmo, mas é totalmente opcional.
        </p>
      </header>
      <PrivacyForm />
    </>
  );
}
