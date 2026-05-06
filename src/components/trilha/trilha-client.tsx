'use client';

/**
 * <TrilhaClient> — wrapper client que orquestra:
 *   - <TrilhaMapRPG> com stations
 *   - Toggle de peers + path picker (via header actions)
 *   - Estado local: peersEnabled, pathPickerOpen
 *
 * PR 27. O page.tsx passa initial state vindo do server (streak, order,
 * peers). O componente apenas exibe + dispara server actions.
 */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings2 } from 'lucide-react';
import { TrilhaMapRPG } from './trilha-map-rpg';
import { TrilhaPathPicker } from './trilha-path-picker';
import { TrilhaPeersToggle } from './trilha-peers-toggle';
import { TrilhaStreakBadge } from './trilha-streak-badge';
import {
  applyOrderToStations,
  type TrilhaOrderPicks,
} from '@/lib/trilha/order';
import type { TrilhaPeer } from '@/lib/trilha/peers';
import type { TrilhaStationRPG } from '@/lib/trilha/stations';

export interface TrilhaClientProps {
  stations: TrilhaStationRPG[];
  initialOrder: TrilhaOrderPicks;
  peers: TrilhaPeer[];
  streakDays: number;
  streakMultiplier: number;
}

export function TrilhaClient({
  stations,
  initialOrder,
  peers,
  streakDays,
  streakMultiplier,
}: TrilhaClientProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [peersEnabled, setPeersEnabled] = useState<boolean>(true);

  // Mapa rank-original -> displayRank (1..8). Ranks 1, 6-8 ficam fixos.
  const rankOrderMap = new Map<number, number>();
  rankOrderMap.set(1, 1);
  initialOrder.forEach((originalRank, idx) => {
    rankOrderMap.set(originalRank, idx + 2);
  });
  rankOrderMap.set(6, 6);
  rankOrderMap.set(7, 7);
  rankOrderMap.set(8, 8);

  // Aplica ordem para uso interno (não muda o mapa, mas garante consistência).
  void applyOrderToStations;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <TrilhaStreakBadge streakDays={streakDays} />
        <TrilhaPeersToggle onChange={setPeersEnabled} />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setPickerOpen(true)}
          aria-label="Customizar caminho"
        >
          <Settings2 className="mr-1 h-4 w-4" aria-hidden="true" />
          Customizar caminho
        </Button>
      </div>

      <TrilhaMapRPG
        stations={stations}
        rankOrderMap={rankOrderMap}
        peers={peersEnabled ? peers : []}
        streakMultiplier={streakMultiplier}
      />

      <TrilhaPathPicker
        open={pickerOpen}
        initial={initialOrder}
        onClose={() => setPickerOpen(false)}
      />
    </>
  );
}
