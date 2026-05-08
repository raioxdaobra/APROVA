'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface Props {
  url: string;
}

export function CopyLinkButton({ url }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      if (navigator.share) {
        // Em mobile, abre o sheet nativo de compartilhar (WhatsApp, SMS, etc)
        await navigator.share({ url, title: 'APROVA — Vestibular Unifor Medicina' });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-border bg-secondary px-3 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
      aria-label={copied ? 'Link copiado' : 'Copiar ou compartilhar link'}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
          Copiado
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          Copiar
        </>
      )}
    </button>
  );
}
