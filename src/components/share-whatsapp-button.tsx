'use client';

import { Share2 } from 'lucide-react';

interface Props {
  message: string;
}

/**
 * Botão "Convidar amigo" que abre o WhatsApp com a mensagem pré-formatada.
 * Em mobile, usa o app nativo. Em desktop, abre web.whatsapp.com.
 */
export function ShareWhatsAppButton({ message }: Props) {
  const handleClick = () => {
    const encoded = encodeURIComponent(message);
    // wa.me/?text= funciona em mobile e desktop (redireciona pro app/web)
    window.open(`https://wa.me/?text=${encoded}`, '_blank', 'noopener');
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]"
    >
      <Share2 className="h-4 w-4" aria-hidden="true" />
      Convidar amigos pelo WhatsApp
    </button>
  );
}
