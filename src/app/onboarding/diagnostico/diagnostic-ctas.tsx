'use client';

import { Button } from '@/components/ui/button';
import { track } from '@/lib/analytics';
import { skipDiagnostic, startDiagnostic } from './actions';

export function DiagnosticCTAs() {
  return (
    <div className="flex flex-col items-center gap-3">
      <form
        action={startDiagnostic}
        className="w-full"
        onSubmit={() => track('onboarding_finished', { did_diagnostic: true })}
      >
        <Button type="submit" size="lg" className="w-full">
          Faça suas 5 primeiras questões
        </Button>
      </form>

      <form
        action={skipDiagnostic}
        className="w-full"
        onSubmit={() => track('onboarding_finished', { did_diagnostic: false })}
      >
        <Button type="submit" variant="ghost" className="w-full">
          Pular pro app
        </Button>
      </form>
    </div>
  );
}
