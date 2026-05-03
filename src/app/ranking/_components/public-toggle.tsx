'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { togglePublicLeaderboard } from '../actions';

export function PublicLeaderboardToggle({ initial }: { initial: boolean }) {
  const [checked, setChecked] = useState(initial);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const onChange = (next: boolean) => {
    const previous = checked;
    setChecked(next);
    startTransition(async () => {
      const formData = new FormData();
      formData.set('next', next ? 'true' : 'false');
      const result = await togglePublicLeaderboard(formData);
      if (!result.ok) {
        setChecked(previous);
        toast.error(result.error);
        return;
      }
      toast.success(next ? 'Você aparece no ranking.' : 'Perfil oculto do ranking.');
      router.refresh();
    });
  };

  return (
    <label className="flex items-center gap-3 text-sm font-medium text-foreground">
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        disabled={pending}
        aria-label="Aparecer no ranking"
      />
      <span>Aparecer no ranking</span>
      {pending ? <span className="text-xs text-muted-foreground">salvando…</span> : null}
    </label>
  );
}
