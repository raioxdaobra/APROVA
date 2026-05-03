import { cn } from '@/lib/utils';

/**
 * Chip de dificuldade baseado no % de acerto global da questão.
 *
 * Regras (P2 do design):
 *   correct_pct === null → não renderiza (sem dados)
 *   > 75 → Fácil (verde)
 *   40-75 → Média (amber)
 *   < 40 → Difícil (vermelho)
 *
 * Server Component — pode ser usado em qualquer surface; o consumidor é
 * responsável por buscar `correct_pct` da view `question_stats`.
 */
export function DifficultyChip({
  correct_pct,
  className,
}: {
  correct_pct: number | null;
  className?: string;
}) {
  if (correct_pct === null || correct_pct === undefined) return null;

  let label: string;
  let toneClass: string;
  let title: string;
  if (correct_pct > 75) {
    label = 'Fácil';
    toneClass = 'bg-success-bg text-success';
    title = `Fácil — ${Math.round(correct_pct)}% de acerto global`;
  } else if (correct_pct >= 40) {
    label = 'Média';
    toneClass = 'bg-warning-bg text-warning';
    title = `Média — ${Math.round(correct_pct)}% de acerto global`;
  } else {
    label = 'Difícil';
    toneClass = 'bg-error-bg text-error';
    title = `Difícil — ${Math.round(correct_pct)}% de acerto global`;
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
        toneClass,
        className,
      )}
      title={title}
      aria-label={title}
    >
      {label}
    </span>
  );
}
