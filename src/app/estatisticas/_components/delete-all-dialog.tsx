'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { deleteAllProgress } from '../actions';

export function DeleteAllDialog({ username }: { username: string }) {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [confirmedFirstStep, setConfirmedFirstStep] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const reset = () => {
    setOpen(false);
    setConfirmation('');
    setConfirmedFirstStep(false);
  };

  const matches = confirmation.trim() === username;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!matches) return;
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await deleteAllProgress(formData);
      if (result.ok) {
        toast.success('Progresso apagado.');
        reset();
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <>
      <Button
        type="button"
        variant="destructive"
        size="md"
        onClick={() => setOpen(true)}
      >
        Apagar tudo
      </Button>

      {open && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <button
            type="button"
            aria-label="Fechar"
            className="absolute inset-0 cursor-default"
            onClick={() => {
              if (!pending) reset();
            }}
            disabled={pending}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-all-title"
            className="relative w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg"
          >
            <h2 id="delete-all-title" className="text-lg font-semibold text-foreground">
              Apagar todo o progresso?
            </h2>

            {!confirmedFirstStep ? (
              <>
                <p className="mt-2 text-sm text-muted-foreground">
                  Isso remove permanentemente: tentativas, sessões de estudo, status de
                  questões, XP semanal, sequência e domínio de subtópicos. Sua conta e
                  perfil permanecem.
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Esta ação <span className="font-semibold text-foreground">não pode ser desfeita</span>.
                </p>
                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button type="button" variant="secondary" onClick={reset}>
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setConfirmedFirstStep(true)}
                  >
                    Continuar
                  </Button>
                </div>
              </>
            ) : (
              <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-3">
                <p className="text-sm text-muted-foreground">
                  Para confirmar, digite seu username{' '}
                  <span className="font-mono font-semibold text-foreground">{username}</span>.
                </p>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="confirmation">Username</Label>
                  <Input
                    id="confirmation"
                    name="confirmation"
                    value={confirmation}
                    onChange={(event) => setConfirmation(event.target.value)}
                    autoComplete="off"
                    disabled={pending}
                  />
                </div>
                <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={reset}
                    disabled={pending}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={!matches || pending}
                  >
                    {pending ? 'Apagando…' : 'Apagar permanentemente'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
