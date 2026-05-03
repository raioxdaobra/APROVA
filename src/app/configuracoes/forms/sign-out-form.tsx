'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { signOutAction } from '../actions';

export function SignOutForm() {
  return (
    <form action={signOutAction}>
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" variant="secondary" disabled={pending} className="w-full">
      {pending ? 'Saindo...' : 'Sair'}
    </Button>
  );
}
