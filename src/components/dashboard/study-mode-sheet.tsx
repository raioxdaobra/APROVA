'use client';

/**
 * Bottom-sheet "Como você quer treinar?" — abre quando user clica no card
 * "Resolver questões" do dashboard. Inspirado no fluxo do respostaCerta:
 * em vez de cair direto no /quiz com filtros (que pode confundir
 * iniciantes), apresenta 3 modos claros e deixa o user escolher.
 *
 * Modos:
 *   1. Bloco rápido    → /quiz?random=true (atalho aleatório que ja existia)
 *   2. Por área        → /quiz (tela de selecionar disciplinas)
 *   3. Revisar erros   → /quiz?status=wrong (questoes que errou)
 *
 * Mobile: bottom sheet com handle drag. Desktop: modal centralizado.
 */
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Dices, Target, RotateCw, X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Total de questões disponíveis (mostrado no card "Por área" como contexto). */
  totalQuestions: number;
}

interface ModeOption {
  href: string;
  Icon: typeof Dices;
  emoji: string;
  label: string;
  description: string;
  badge: string;
  badgeBg: string;
  badgeText: string;
}

export function StudyModeSheet({ open, onClose, totalQuestions }: Props) {
  const sheetRef = useRef<HTMLDivElement | null>(null);

  // ESC fecha
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Trava scroll do body enquanto aberto (evita "pular" no mobile)
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const options: ModeOption[] = [
    {
      href: '/quiz?random=true',
      Icon: Dices,
      emoji: '📚',
      label: 'Bloco rápido',
      description: 'Questões aleatórias, dificuldade variada',
      badge: 'Recomendado pra estudar',
      badgeBg: 'bg-warning-bg',
      badgeText: 'text-warning',
    },
    {
      href: '/quiz',
      Icon: Target,
      emoji: '🎯',
      label: 'Por área de interesse',
      description: `Você escolhe os tópicos · ${totalQuestions} questões disponíveis`,
      badge: 'Foco específico',
      badgeBg: 'bg-primary-light',
      badgeText: 'text-primary',
    },
    {
      href: '/revisar-erros',
      Icon: RotateCw,
      emoji: '🔁',
      label: 'Revisar erros',
      description: 'Volta nas questões que você errou — com estatísticas',
      badge: 'Reforço',
      badgeBg: 'bg-success-bg',
      badgeText: 'text-success',
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="study-mode-sheet-title"
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Fechar"
        className="absolute inset-0 cursor-default bg-black/60"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="relative w-full max-w-md rounded-t-2xl border border-border bg-card p-5 pb-8 shadow-xl sm:rounded-2xl sm:pb-5"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1.25rem)' }}
      >
        {/* Drag handle (visual cue mobile) */}
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-muted sm:hidden" />

        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h2
            id="study-mode-sheet-title"
            className="text-lg font-semibold text-foreground"
          >
            Como você quer treinar?
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <ul className="flex flex-col gap-2.5">
          {options.map((opt) => (
            <li key={opt.href}>
              <Link
                href={opt.href}
                onClick={onClose}
                className="group block rounded-xl border border-border bg-background p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-xl"
                  >
                    {opt.emoji}
                  </span>
                  <div className="flex flex-1 flex-col gap-0.5">
                    <span className="text-base font-semibold text-foreground">
                      {opt.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {opt.description}
                    </span>
                    <span
                      className={`mt-1.5 inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${opt.badgeBg} ${opt.badgeText}`}
                    >
                      {opt.badge}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
