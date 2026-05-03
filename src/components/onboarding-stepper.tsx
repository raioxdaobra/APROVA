import { cn } from '@/lib/utils';

interface OnboardingStepperProps {
  current: 1 | 2 | 3;
}

const STEPS = [1, 2, 3] as const;

export function OnboardingStepper({ current }: OnboardingStepperProps) {
  return (
    <ol
      className="flex w-full items-center justify-center gap-0"
      aria-label={`Passo ${current} de 3`}
    >
      {STEPS.map((step, idx) => {
        const isActive = step === current;
        const isCompleted = step < current;
        const isLast = idx === STEPS.length - 1;
        return (
          <li key={step} className="flex flex-1 items-center last:flex-none">
            <span
              aria-current={isActive ? 'step' : undefined}
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors',
                isActive && 'border-primary bg-primary text-primary-foreground',
                isCompleted && 'border-primary bg-primary text-primary-foreground',
                !isActive && !isCompleted && 'border-border text-muted-foreground',
              )}
            >
              {step}
            </span>
            {!isLast && (
              <span
                aria-hidden="true"
                className={cn(
                  'mx-2 h-0.5 flex-1',
                  isCompleted ? 'bg-primary' : 'bg-border',
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
