'use client';

/**
 * Feedback "⭐ O que achou da resolução?" — inspirado no respostaCerta.
 *
 * 4 emoji-buttons (Ruim / Regular / Ótima / Excelente). Click salva em
 * localStorage por question_id. Após votar, mostra estado "Obrigado!"
 * sem permitir mudar (decisão simples — pode revisitar depois).
 *
 * Persistência: localStorage `aprova:resolution-feedback:{questionId}`.
 * Quando virar valor real, migra pra tabela DB. Por enquanto é só sinal
 * pro user de "minha opinião conta", sem analytics no admin ainda.
 */
import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';

type Rating = 'ruim' | 'regular' | 'otima' | 'excelente';

interface Option {
  value: Rating;
  emoji: string;
  label: string;
  /** Cor da borda quando selecionado. */
  accent: string;
}

const OPTIONS: Option[] = [
  { value: 'ruim', emoji: '😡', label: 'Ruim', accent: '#ef4444' },
  { value: 'regular', emoji: '😐', label: 'Regular', accent: '#f59e0b' },
  { value: 'otima', emoji: '😀', label: 'Ótima', accent: '#10b981' },
  { value: 'excelente', emoji: '🤩', label: 'Excelente', accent: '#8b5cf6' },
];

const STORAGE_KEY_PREFIX = 'aprova:resolution-feedback:';

interface Props {
  questionId: string;
}

export function ResolutionFeedback({ questionId }: Props) {
  const [rating, setRating] = useState<Rating | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}${questionId}`);
      if (saved && (OPTIONS.some((o) => o.value === saved))) {
        setRating(saved as Rating);
      }
    } catch {
      // localStorage indisponível: tudo bem, fica vazio.
    }
    setHydrated(true);
  }, [questionId]);

  function handleVote(value: Rating) {
    setRating(value);
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${questionId}`, value);
    } catch {
      // sem persistência — vota só pra esta sessão
    }
  }

  if (!hydrated) return null;

  if (rating !== null) {
    const opt = OPTIONS.find((o) => o.value === rating);
    return (
      <div
        className="flex items-center gap-2 rounded-lg border border-success/30 bg-success-bg/30 p-3 text-sm text-success"
        role="status"
      >
        <span aria-hidden="true">✓</span>
        <span>
          Obrigado pelo feedback{opt ? ` ${opt.emoji}` : ''}! Sua opinião nos ajuda a
          melhorar as resoluções.
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <Star className="h-5 w-5 text-warning" aria-hidden="true" />
        <h4 className="text-sm font-semibold text-foreground">
          O que achou da resolução?
        </h4>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Ajude-nos a melhorar. Sua opinião é muito importante.
      </p>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleVote(opt.value)}
            className="flex flex-col items-center gap-1 rounded-lg border border-border bg-background px-2 py-2.5 text-xs font-medium text-foreground transition-all hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            style={{ borderColor: 'transparent' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = opt.accent;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent';
            }}
            aria-label={`Avaliar resolução como ${opt.label.toLowerCase()}`}
          >
            <span aria-hidden="true" className="text-2xl leading-none">
              {opt.emoji}
            </span>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
