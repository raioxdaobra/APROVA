'use client';

/**
 * Card destacado no topo do resultado do simulado que convida o user
 * a revisar os erros com IA. Click → dispatcha CustomEvent pro primeiro
 * expander de questão errada abrir + scroll suave.
 */
import { Sparkles, ArrowDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Props {
  wrongCount: number;
  /** IDs das questões erradas, na ordem de exibição. */
  wrongQuestionIds: string[];
}

export function ReviewErrorsBanner({ wrongCount, wrongQuestionIds }: Props) {
  if (wrongCount === 0 || wrongQuestionIds.length === 0) return null;

  function handleStart() {
    const firstId = wrongQuestionIds[0];
    if (!firstId) return;
    window.dispatchEvent(
      new CustomEvent('aprova:expand-question', {
        detail: { questionId: firstId },
      }),
    );
  }

  return (
    <Card className="flex flex-col gap-3 border-2 border-primary/40 bg-primary/5 p-5 sm:flex-row sm:items-center">
      <div className="flex flex-1 items-start gap-3">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary"
        >
          <Sparkles className="h-5 w-5" />
        </span>
        <div className="flex flex-col gap-0.5">
          <p className="text-base font-semibold text-foreground">
            Você errou {wrongCount} {wrongCount === 1 ? 'questão' : 'questões'}.
          </p>
          <p className="text-sm text-muted-foreground">
            Bora revisar com a IA — explicação direta em cada uma. Aproveita
            enquanto está fresco.
          </p>
        </div>
      </div>
      <Button
        type="button"
        size="lg"
        onClick={handleStart}
        className="shrink-0 gap-1.5"
      >
        <ArrowDown className="h-4 w-4" aria-hidden="true" />
        Revisar erros com IA
      </Button>
    </Card>
  );
}
