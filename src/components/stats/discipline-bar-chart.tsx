'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const DISCIPLINE_LABELS: Record<string, string> = {
  matematica: 'Matemática',
  fisica: 'Física',
  quimica: 'Química',
  biologia: 'Biologia',
  humanas: 'Humanas',
  linguagens: 'Linguagens',
};

// Cores por disciplina alinhadas à paleta de acentos da PR 15.
// Tokens HSL via CSS vars já definidos em globals.css / tailwind config.
const ACCENT_VARS: Record<string, string> = {
  matematica: '--accent-quiz', // laranja
  fisica: '--accent-simulado', // azul cobalto
  quimica: '--accent-trilha', // verde-esmeralda
  biologia: '--accent-chat', // teal
  humanas: '--accent-jogos', // roxo
  linguagens: '--accent-ranking', // âmbar
};

export interface DisciplineRow {
  discipline: string;
  total: number; // questões disponíveis
  resolved: number; // resolvidas
  correct: number; // acertos entre resolvidas
}

export function DisciplineBarChart({ rows }: { rows: DisciplineRow[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const router = useRouter();

  const enriched = rows
    .map((r) => {
      const accuracy = r.resolved === 0 ? 0 : Math.round((r.correct / r.resolved) * 100);
      return { ...r, accuracy };
    })
    .sort((a, b) => b.total - a.total);

  const handleClick = (discipline: string) => {
    // PR 29: click em uma barra leva pro /quiz com aquela disciplina pré-selecionada.
    router.push(`/quiz?selected=${encodeURIComponent(`${discipline}:*`)}`);
  };

  // Dimensão da barra é proporcional ao % de acerto (0–100).
  // Largura mínima visual mesmo com 0% pra deixar o rótulo legível.
  return (
    <ul className="flex flex-col gap-3" aria-label="Acerto por disciplina">
      {enriched.map((row) => {
        const accent = ACCENT_VARS[row.discipline] ?? '--accent-quiz';
        const label = DISCIPLINE_LABELS[row.discipline] ?? row.discipline;
        const widthPct = row.accuracy === 0 ? 4 : row.accuracy;
        const isHovered = hovered === row.discipline;
        return (
          <li key={row.discipline} className="flex flex-col gap-0">
            <button
              type="button"
              onClick={() => handleClick(row.discipline)}
              onMouseEnter={() => setHovered(row.discipline)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(row.discipline)}
              onBlur={() => setHovered(null)}
              onTouchStart={() => setHovered(row.discipline)}
              aria-label={`Abrir quiz de ${label}`}
              title={`Abrir quiz de ${label}`}
              className="flex w-full flex-col gap-1 rounded p-1 -m-1 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2"
              style={{
                boxShadow: isHovered
                  ? `inset 0 0 0 1px hsl(var(${accent}) / 0.3)`
                  : undefined,
              }}
            >
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span className="font-medium text-foreground">{label}</span>
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {row.resolved}/{row.total}
                  <span
                    className="ml-2 font-semibold"
                    style={{ color: `hsl(var(${accent}))` }}
                  >
                    {row.resolved === 0 ? '—' : `${row.accuracy}%`}
                  </span>
                </span>
              </div>
              <div
                role="img"
                aria-label={`${label}: ${row.resolved} de ${row.total} resolvidas, ${
                  row.resolved === 0 ? 'sem dados' : `${row.accuracy}% de acerto`
                }`}
                className="relative h-3 w-full overflow-hidden rounded-full bg-muted"
              >
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: `hsl(var(${accent}))`,
                    opacity: isHovered ? 1 : 0.85,
                  }}
                />
              </div>
              {isHovered ? (
                <div
                  className="text-xs text-muted-foreground"
                  style={{ color: `hsl(var(${accent}))` }}
                  role="status"
                >
                  {row.resolved} resolvidas / {row.total} disponíveis ·{' '}
                  {row.correct} acertos · clique pra praticar
                </div>
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
