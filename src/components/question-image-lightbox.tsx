'use client';

/**
 * Lightbox modal para imagens de questões.
 *
 * Suporta zoom via wheel (desktop) e pinch (touch). Botões `+` / `-` / `1:1`.
 * ESC fecha. `role=dialog` + `aria-modal=true` + focus trap simples.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  src: string;
  alt: string;
  onClose: () => void;
}

const MIN_SCALE = 0.5;
const MAX_SCALE = 6;
const SCALE_STEP = 0.25;

interface PointerData {
  id: number;
  x: number;
  y: number;
}

export function QuestionImageLightbox({ open, src, alt, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const pointersRef = useRef<Map<number, PointerData>>(new Map());
  const lastDistanceRef = useRef<number | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(
    null,
  );

  // Reset transform ao abrir
  useEffect(() => {
    if (open) {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
    }
  }, [open]);

  // Trava scroll do body enquanto aberto
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // ESC fecha + focus inicial no botão fechar
  useEffect(() => {
    if (!open) return;
    closeBtnRef.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
      // focus trap: Tab cicla dentro do dialog
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0]!;
        const last = focusables[focusables.length - 1]!;
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [open, onClose]);

  const clampScale = useCallback((v: number) => {
    return Math.min(MAX_SCALE, Math.max(MIN_SCALE, v));
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -SCALE_STEP : SCALE_STEP;
      setScale((s) => clampScale(s + delta));
    },
    [clampScale],
  );

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointersRef.current.set(e.pointerId, {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
    });
    if (pointersRef.current.size === 1) {
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        tx: translate.x,
        ty: translate.y,
      };
    }
    if (pointersRef.current.size === 2) {
      const pts = Array.from(pointersRef.current.values());
      const dx = pts[0]!.x - pts[1]!.x;
      const dy = pts[0]!.y - pts[1]!.y;
      lastDistanceRef.current = Math.hypot(dx, dy);
    }
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }, [translate.x, translate.y]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!pointersRef.current.has(e.pointerId)) return;
      pointersRef.current.set(e.pointerId, {
        id: e.pointerId,
        x: e.clientX,
        y: e.clientY,
      });

      if (pointersRef.current.size === 2) {
        const pts = Array.from(pointersRef.current.values());
        const dx = pts[0]!.x - pts[1]!.x;
        const dy = pts[0]!.y - pts[1]!.y;
        const dist = Math.hypot(dx, dy);
        const last = lastDistanceRef.current;
        if (last !== null && last > 0) {
          const ratio = dist / last;
          setScale((s) => clampScale(s * ratio));
        }
        lastDistanceRef.current = dist;
        return;
      }

      if (pointersRef.current.size === 1 && dragStartRef.current) {
        const start = dragStartRef.current;
        const dx = e.clientX - start.x;
        const dy = e.clientY - start.y;
        setTranslate({ x: start.tx + dx, y: start.ty + dy });
      }
    },
    [clampScale],
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) {
      lastDistanceRef.current = null;
    }
    if (pointersRef.current.size === 0) {
      dragStartRef.current = null;
    } else if (pointersRef.current.size === 1) {
      const remaining = Array.from(pointersRef.current.values())[0]!;
      dragStartRef.current = {
        x: remaining.x,
        y: remaining.y,
        tx: translate.x,
        ty: translate.y,
      };
    }
  }, [translate.x, translate.y]);

  const transformStyle = useMemo<React.CSSProperties>(
    () => ({
      transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
      transition: pointersRef.current.size > 0 ? 'none' : 'transform 120ms ease-out',
      transformOrigin: 'center center',
    }),
    [scale, translate.x, translate.y],
  );

  if (!open) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Visualização ampliada da questão"
      className="fixed inset-0 z-[60] flex h-screen w-screen flex-col bg-black/90"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-black/40 px-3 py-2 text-white">
        <span className="text-xs text-white/70">
          Zoom: {Math.round(scale * 100)}% — arraste para mover
        </span>
        <div className="flex items-center gap-1">
          <ToolbarButton
            label="Diminuir zoom"
            onClick={() => setScale((s) => clampScale(s - SCALE_STEP))}
          >
            −
          </ToolbarButton>
          <ToolbarButton
            label="Tamanho original"
            onClick={() => {
              setScale(1);
              setTranslate({ x: 0, y: 0 });
            }}
          >
            1:1
          </ToolbarButton>
          <ToolbarButton
            label="Aumentar zoom"
            onClick={() => setScale((s) => clampScale(s + SCALE_STEP))}
          >
            +
          </ToolbarButton>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar (Esc)"
            className="ml-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white hover:bg-white/20"
          >
            Fechar (Esc)
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        className={cn(
          'relative flex flex-1 select-none items-center justify-center overflow-hidden',
          'touch-none',
        )}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="max-h-full max-w-full"
          style={transformStyle}
        />
      </div>
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white hover:bg-white/20"
    >
      {children}
    </button>
  );
}
