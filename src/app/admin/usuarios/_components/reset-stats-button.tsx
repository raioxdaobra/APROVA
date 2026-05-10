'use client';

/**
 * Botao "Zerar estatisticas" do admin — confirma via prompt antes de
 * acionar a server action. Mostra resultado (linhas removidas) ou erro.
 */
import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { resetUserStats } from '../actions';

interface Props {
  userId: string;
  userLabel: string;
}

export function ResetStatsButton({ userId, userLabel }: Props) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  function handleClick() {
    const ok = window.confirm(
      `Zerar TODAS as estatisticas de "${userLabel}"?\n\nIsto remove: tentativas, ` +
        `sessoes, XP semanal, XP diario, streaks, mastery por subtopico, bonus de ` +
        `simulado, flashcards e status de questoes. Acao irreversivel.`,
    );
    if (!ok) return;

    setFeedback(null);
    startTransition(async () => {
      const res = await resetUserStats(userId);
      if (res.ok) {
        const total = Object.values(res.deleted ?? {}).reduce((s, n) => s + n, 0);
        setFeedback(`✓ ${total} linhas removidas`);
      } else {
        setFeedback(`✗ ${res.error}`);
      }
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        type="button"
        size="sm"
        variant="destructive"
        onClick={handleClick}
        disabled={isPending}
      >
        {isPending ? 'Zerando…' : 'Zerar stats'}
      </Button>
      {feedback ? (
        <span className="text-xs text-muted-foreground">{feedback}</span>
      ) : null}
    </div>
  );
}
