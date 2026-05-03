'use client';

import { useState } from 'react';
import { Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

type ShareType = 'streak' | 'badge' | 'rank';

interface ShareButtonProps {
  type: ShareType;
  value: string | number;
  user?: string | null;
  label?: string;
  /** URL pública pra compartilhar (a página alvo); default: home */
  shareUrl?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function ShareButton({
  type,
  value,
  user,
  label = 'Compartilhar',
  shareUrl,
  className,
  variant = 'secondary',
  size = 'sm',
}: ShareButtonProps) {
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    if (busy) return;
    setBusy(true);
    try {
      const origin =
        typeof window !== 'undefined' && window.location?.origin
          ? window.location.origin
          : '';
      const params = new URLSearchParams({
        type,
        value: String(value),
      });
      if (user) params.set('user', user);
      const ogUrl = `${origin}/api/og?${params.toString()}`;
      const targetUrl = shareUrl ?? `${origin}/`;
      const text = buildShareText(type, value, user);

      // Tenta Web Share API (mobile)
      const canShare =
        typeof navigator !== 'undefined' && typeof navigator.share === 'function';
      if (canShare) {
        try {
          await navigator.share({
            title: 'APROVA',
            text,
            url: targetUrl,
          });
          return;
        } catch (err) {
          // Se o usuário cancelou (AbortError), não fallback
          if (err instanceof Error && err.name === 'AbortError') return;
          // outros erros → cai no copy
        }
      }

      // Fallback: copia URL da OG image (com link da plataforma)
      const fullText = `${text}\n${targetUrl}\n${ogUrl}`;
      try {
        await navigator.clipboard.writeText(fullText);
        toast.success('Link copiado');
      } catch {
        toast.error('Não foi possível copiar o link');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={busy}
      className={className}
    >
      <Share2 className="mr-2 h-4 w-4" aria-hidden />
      {label}
    </Button>
  );
}

function buildShareText(
  type: ShareType,
  value: string | number,
  user?: string | null,
): string {
  const u = user ? `@${user}` : 'eu';
  switch (type) {
    case 'badge':
      return `${u} desbloqueou "${value}" no APROVA!`;
    case 'rank':
      return `${u} subiu pra "${value}" no APROVA!`;
    case 'streak':
    default: {
      const n = Number(value);
      return `${u} está com ${n} ${n === 1 ? 'dia seguido' : 'dias seguidos'} estudando no APROVA!`;
    }
  }
}
