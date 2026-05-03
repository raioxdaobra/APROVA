'use client';

/**
 * Layout responsivo da tela de questão.
 *
 * - Mobile (<lg): 1-col scroll natural — image no topo, body abaixo.
 * - Desktop (≥lg): grid 2-col [3fr 2fr] — image esquerda sticky, body direita.
 * - Fullscreen: tecla `F` (ou botão `⛶`) → fixed inset-0 z-50 100vh, escondendo
 *   nav externa. ESC sai do fullscreen.
 * - Image clicável → abre lightbox com zoom.
 *
 * Não toca em estado de quiz/simulado/diagnóstico — apenas renderiza slots.
 */
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils';
import { QuestionImageLightbox } from '@/components/question-image-lightbox';

interface Props {
  /** Slot da imagem (renderizado na coluna esquerda no desktop). */
  image: ReactNode;
  /** Slot do conteúdo (header + alternatives + footer + extras). */
  body: ReactNode;
  /** URL da imagem para o lightbox (clique/⛶ abre). */
  imageUrl: string;
  /** Alt da imagem para a11y do lightbox. */
  imageAlt: string;
  /** Habilita o toggle ⛶ + hotkey F. Default `true`. */
  enableFullscreen?: boolean;
  /** Habilita o lightbox via clique na imagem. Default `true`. */
  enableLightbox?: boolean;
  /** Wrapper class adicional (mobile-first). */
  className?: string;
}

export function QuestionLayout({
  image,
  body,
  imageUrl,
  imageAlt,
  enableFullscreen = true,
  enableLightbox = true,
  className,
}: Props) {
  const [fullscreen, setFullscreen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    setFullscreen((v) => !v);
  }, []);

  const openLightbox = useCallback(() => {
    if (!enableLightbox) return;
    setLightboxOpen(true);
  }, [enableLightbox]);

  // Hotkey F (ignora INPUT/TEXTAREA/contentEditable). ESC sai do fullscreen.
  useEffect(() => {
    if (!enableFullscreen && !fullscreen) return;
    const handler = (e: KeyboardEvent) => {
      const target = e.target;
      if (target instanceof HTMLElement) {
        const tag = target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        if (target.isContentEditable) return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'f' || e.key === 'F') {
        if (!enableFullscreen) return;
        e.preventDefault();
        setFullscreen((v) => !v);
      } else if (e.key === 'Escape' && fullscreen && !lightboxOpen) {
        setFullscreen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [enableFullscreen, fullscreen, lightboxOpen]);

  // Quando entra em fullscreen, marca o body para esconder nav externas (caso
  // alguma layout queira reagir via CSS). Sem scroll-lock — fullscreen tem seu
  // próprio overflow-auto.
  useEffect(() => {
    if (!fullscreen) return;
    document.documentElement.dataset.questionFullscreen = 'true';
    return () => {
      delete document.documentElement.dataset.questionFullscreen;
    };
  }, [fullscreen]);

  const wrapperClass = useMemo(
    () =>
      cn(
        'grid w-full gap-4 lg:gap-6 lg:grid-cols-[3fr_2fr]',
        // No fullscreen, ocupa viewport inteiro com scroll vertical.
        fullscreen
          ? 'fixed inset-0 z-50 h-screen w-screen overflow-auto bg-background p-4 lg:p-6'
          : 'relative',
        className,
      ),
    [fullscreen, className],
  );

  const imageColumnClass = cn(
    'flex flex-col gap-3 min-w-0',
    'lg:sticky lg:top-4 lg:self-start',
  );

  const bodyColumnClass = cn('flex flex-col gap-4 min-w-0');

  const imageNode = enableLightbox ? (
    <button
      type="button"
      onClick={openLightbox}
      aria-label="Ampliar imagem da questão"
      className="group block w-full cursor-zoom-in rounded-lg text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
    >
      {image}
    </button>
  ) : (
    image
  );

  return (
    <div className={wrapperClass}>
      <div className={imageColumnClass}>{imageNode}</div>
      <div className={bodyColumnClass}>{body}</div>

      {enableFullscreen ? (
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label={fullscreen ? 'Sair de tela cheia (F)' : 'Tela cheia (F)'}
          aria-pressed={fullscreen}
          title={fullscreen ? 'Sair de tela cheia (F)' : 'Tela cheia (F)'}
          className={cn(
            'fixed bottom-4 right-4 z-[55] inline-flex h-11 w-11 items-center justify-center',
            'rounded-full border border-border bg-card text-foreground shadow-md',
            'hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
          )}
        >
          <span aria-hidden className="text-lg leading-none">
            {fullscreen ? '⛶' : '⛶'}
          </span>
        </button>
      ) : null}

      {enableLightbox ? (
        <QuestionImageLightbox
          open={lightboxOpen}
          src={imageUrl}
          alt={imageAlt}
          onClose={() => setLightboxOpen(false)}
        />
      ) : null}
    </div>
  );
}
