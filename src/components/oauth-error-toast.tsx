'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export function OAuthErrorToast() {
  const params = useSearchParams();
  const error = params.get('error');

  useEffect(() => {
    if (error === 'oauth_unavailable') {
      toast.error('Login com Google indisponível no momento.', {
        description: 'Tente criar uma conta com email enquanto isso.',
      });
    }
  }, [error]);

  return null;
}
