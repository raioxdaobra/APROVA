'use client';

/**
 * Botão "Voltar" reusable. Usado em todo lugar do app onde a profundidade
 * de navegação faria o user se perder ("cliquei aqui e não tem como voltar").
 *
 * Comportamento:
 *   - Se houver histórico do browser (user navegou de outra rota interna),
 *     volta com router.back()
 *   - Se for entrada direta (deep-link, refresh, share), cai pro fallbackHref
 *     (default: /dashboard)
 *
 * Visual: caixinha clicável com texto "Voltar" — sem seta, conforme
 * preferência do user. Border + bg-card + hover bg-muted pra deixar bem
 * claro que é clicável. Tap target h-9 (36px), respeitando WCAG.
 */
import { useRouter } from 'next/navigation';

interface BackButtonProps {
  /** Rota fallback se não houver histórico de browser. Default: /dashboard. */
  fallbackHref?: string;
  /** Texto do botão. Default: "Voltar". */
  label?: string;
  /** Classe extra opcional pra ajustar margens. */
  className?: string;
}

export function BackButton({
  fallbackHref = '/dashboard',
  label = 'Voltar',
  className,
}: BackButtonProps) {
  const router = useRouter();

  function handleClick() {
    // window.history.length > 1 não é 100% confiável (PWAs e iframes podem
    // ter length=1 em sessões fresh) mas é o melhor heurístico disponível
    // sem manter um stack próprio. Em caso de duvida, prefere o fallback.
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      className={[
        'inline-flex h-9 items-center justify-center rounded-md border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        className ?? '',
      ].join(' ')}
    >
      {label}
    </button>
  );
}
