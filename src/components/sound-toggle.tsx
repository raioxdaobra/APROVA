'use client';

/**
 * Switch para ligar/desligar sons. Persiste em
 * `localStorage['aprova-sounds']`. Usado em /configuracoes.
 *
 * Default por dispositivo: ON em mobile (≤768px), OFF em desktop —
 * o primeiro toggle do user passa a valer.
 */

import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  getAudioPlayer,
  getSoundPreference,
  setSoundPreference,
} from '@/lib/audio/player';

export function SoundToggle() {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setEnabled(getSoundPreference() === 'on');
    setHydrated(true);
  }, []);

  const handleChange = (next: boolean) => {
    setEnabled(next);
    setSoundPreference(next ? 'on' : 'off');
    if (next) {
      // feedback imediato — toca o som de acerto baixinho
      try {
        getAudioPlayer().play('correct');
      } catch {
        /* noop */
      }
    }
  };

  return (
    <div className="flex items-start gap-4 rounded-lg border border-border bg-background p-4">
      <div className="flex flex-1 flex-col gap-1">
        <Label htmlFor="cfg-sounds" className="text-base">
          Sons no app
        </Label>
        <p className="text-xs text-muted-foreground">
          Acerto, erro, badge desbloqueado e level-up. Ajustamos o padrão
          ao seu dispositivo (ON no celular, OFF no desktop).
        </p>
      </div>
      <Switch
        id="cfg-sounds"
        checked={enabled}
        onCheckedChange={handleChange}
        disabled={!hydrated}
        aria-label={enabled ? 'Desativar sons' : 'Ativar sons'}
      />
    </div>
  );
}
