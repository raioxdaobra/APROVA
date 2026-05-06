'use client';

import { useState } from 'react';

export interface WeeklyXpPoint {
  weekLabel: string; // ex: "S7"
  weekStart: string; // YYYY-MM-DD
  xp: number;
  questions: number;
  accuracyPct: number | null; // 0-100 ou null se semana sem dados
}

interface Props {
  points: WeeklyXpPoint[];
}

/**
 * LineChart simples em SVG nativo (sem libs externas).
 * Eixo X = semanas (S7-S18), eixo Y = XP.
 * Pontos no laranja primário com gradiente sob a linha.
 * Tooltip funciona com hover (desktop) e tap (mobile).
 */
export function WeeklyXpChart({ points }: Props) {
  const [active, setActive] = useState<number | null>(null);

  const w = 600;
  const h = 180;
  const padX = 16;
  const padY = 24;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;
  const maxXp = Math.max(1, ...points.map((p) => p.xp));
  const n = points.length;

  if (n === 0) {
    return (
      <div className="flex h-44 items-center justify-center text-sm text-muted-foreground">
        Sem dados para exibir.
      </div>
    );
  }

  const xAt = (i: number) => (n === 1 ? padX + innerW / 2 : padX + (i / (n - 1)) * innerW);
  const yAt = (xp: number) => padY + innerH - (xp / maxXp) * innerH;

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i).toFixed(1)} ${yAt(p.xp).toFixed(1)}`)
    .join(' ');

  // Área sob a curva, fechada na linha de base
  const areaPath = `${linePath} L ${xAt(n - 1).toFixed(1)} ${(padY + innerH).toFixed(1)} L ${xAt(0).toFixed(1)} ${(padY + innerH).toFixed(1)} Z`;

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        className="h-44 w-full md:h-52"
        role="img"
        aria-label={`Evolução de XP semanal nas últimas ${n} semanas`}
      >
        <defs>
          <linearGradient id="xp-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--accent-quiz))" stopOpacity="0.45" />
            <stop offset="100%" stopColor="hsl(var(--accent-quiz))" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Linhas de grade horizontais */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
          const y = padY + innerH * frac;
          return (
            <line
              key={frac}
              x1={padX}
              x2={w - padX}
              y1={y}
              y2={y}
              stroke="hsl(0 0% 100% / 0.06)"
              strokeWidth={1}
            />
          );
        })}

        {/* Área */}
        <path d={areaPath} fill="url(#xp-gradient)" />

        {/* Linha */}
        <path
          d={linePath}
          fill="none"
          stroke="hsl(var(--accent-quiz))"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Pontos */}
        {points.map((p, i) => {
          const cx = xAt(i);
          const cy = yAt(p.xp);
          const isActive = active === i;
          return (
            <g key={p.weekStart}>
              <circle
                cx={cx}
                cy={cy}
                r={isActive ? 5 : 3.5}
                fill="hsl(var(--accent-quiz))"
                stroke="var(--card-bg)"
                strokeWidth={2}
              />
              {/* hit area maior pra mobile */}
              <circle
                cx={cx}
                cy={cy}
                r={14}
                fill="transparent"
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onTouchStart={() => setActive(i)}
                onClick={() => setActive(i)}
                style={{ cursor: 'pointer' }}
              >
                <title>{`${p.weekLabel}: ${p.xp} XP, ${p.questions} questões${
                  p.accuracyPct !== null ? `, ${p.accuracyPct}% de acerto` : ''
                }`}</title>
              </circle>
            </g>
          );
        })}
      </svg>

      {/* Eixo X */}
      <div className="mt-1 flex justify-between px-2 text-[10px] text-muted-foreground">
        {points.map((p, i) => (
          <span
            key={p.weekStart}
            className={
              i === active ? 'font-semibold text-foreground' : 'tabular-nums'
            }
          >
            {p.weekLabel}
          </span>
        ))}
      </div>

      {/* Tooltip ativo */}
      {(() => {
        const activePoint = active !== null ? points[active] : undefined;
        if (!activePoint) {
          return (
            <div className="mt-2 text-xs text-muted-foreground">
              Toque ou passe o mouse num ponto pra ver detalhes.
            </div>
          );
        }
        return (
          <div className="mt-2 rounded-md border border-border bg-card px-3 py-2 text-xs text-foreground">
            <span
              className="font-semibold"
              style={{ color: 'hsl(var(--accent-quiz))' }}
            >
              {activePoint.weekLabel}
            </span>
            <span className="ml-2 tabular-nums">{activePoint.xp} XP</span>
            <span className="ml-2 text-muted-foreground tabular-nums">
              · {activePoint.questions} questões
              {activePoint.accuracyPct !== null
                ? ` · ${activePoint.accuracyPct}% acerto`
                : ''}
            </span>
          </div>
        );
      })()}
    </div>
  );
}
