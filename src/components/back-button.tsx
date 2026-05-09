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
 * Visual: ícone ← + label opcional (só aparece em sm+ pra economizar espaço
 * em mobile). Tap target generoso (h-9 w-9) pra acessibilidade.
 */
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BackButtonProps {
  /** Rota fallback se não houver histórico de browser. Default: /dashboard. */
  fallbackHref?: string;
  /** Texto adicional ao lado do ícone (só aparece em sm+). */
  label?: string;
  /** Classe extra opcional pra ajustar margens. */
  className?: string;
}

export function BackButton({
  fallbackHref = '/dashboard',
  label,
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
      aria-label="Voltar"
      className={[
        'inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        className ?? '',
      ].join(' ')}
    >
      <ArrowLeft className="h-5 w-5" aria-hidden="true" />
      {label ? <span className="hidden sm:inline">{label}</span> : null}
    </button>
  );
}
