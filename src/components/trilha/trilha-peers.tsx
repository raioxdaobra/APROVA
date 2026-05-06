'use client';

/**
 * <TrilhaPeersOverlay> — pequenos avatares de peers em cima das estações.
 *
 * PR 27. Renderiza no espaço já posicionado pelo `<TrilhaMapRPG>`. Cada
 * estação que é "current" pra ≥ 1 peer ganha 1-3 avatares + chip "+N" se
 * mais de 3.
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  groupPeersByStation,
  peerAvatarColor,
  peerInitials,
  type TrilhaPeer,
} from '@/lib/trilha/peers';

export interface TrilhaPeersOverlayProps {
  peers: TrilhaPeer[];
  /** Render-prop: dada a stationId, retorna o offset (left, top) do node. */
  getStationCenter: (stationId: string) => { x: number; y: number } | null;
}

export function TrilhaPeersOverlay({ peers, getStationCenter }: TrilhaPeersOverlayProps) {
  const groups = groupPeersByStation(peers);

  return (
    <>
      {[...groups.entries()].map(([stationId, list]) => {
        const center = getStationCenter(stationId);
        if (!center) return null;
        return (
          <PeerStack key={stationId} x={center.x} y={center.y} peers={list} />
        );
      })}
    </>
  );
}

interface PeerStackProps {
  x: number;
  y: number;
  peers: TrilhaPeer[];
}

const AVATAR = 22;
const STEP = 14;

function PeerStack({ x, y, peers }: PeerStackProps) {
  const [hover, setHover] = useState<string | null>(null);
  const visible = peers.slice(0, 3);
  const overflow = peers.length - visible.length;

  // Posição: empilhamos à direita-acima do node.
  // x,y é o centro do node; oferta 30px à direita e 28px acima.
  const baseLeft = x + 16;
  const baseTop = y - 36;

  return (
    <div
      className="pointer-events-auto absolute"
      style={{ left: baseLeft, top: baseTop }}
    >
      <div className="relative">
        {visible.map((p, i) => (
          <button
            key={p.peerId}
            type="button"
            onMouseEnter={() => setHover(p.peerId)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(p.peerId)}
            onBlur={() => setHover(null)}
            aria-label={`Colega ${p.displayName} está aqui`}
            className={cn(
              'absolute flex items-center justify-center rounded-full border-2 border-card text-[9px] font-bold text-white shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )}
            style={{
              left: i * STEP,
              top: 0,
              width: AVATAR,
              height: AVATAR,
              backgroundColor: peerAvatarColor(p.peerId),
              zIndex: 10 + i,
            }}
          >
            {peerInitials(p.displayName)}
          </button>
        ))}
        {overflow > 0 && (
          <span
            className="absolute flex items-center justify-center rounded-full border-2 border-card bg-foreground text-[9px] font-bold text-background shadow"
            style={{
              left: visible.length * STEP,
              top: 0,
              width: AVATAR,
              height: AVATAR,
              zIndex: 20,
            }}
          >
            +{overflow}
          </span>
        )}
        {hover && (
          <span
            role="tooltip"
            className="absolute z-30 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-[10px] font-medium text-foreground shadow"
            style={{
              left: 0,
              top: AVATAR + 4,
            }}
          >
            {peers.find((p) => p.peerId === hover)?.displayName}
          </span>
        )}
      </div>
    </div>
  );
}
