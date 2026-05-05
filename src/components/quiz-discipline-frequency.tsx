'use client';

import { useEffect, useState } from 'react';

const DISCIPLINE_LABELS: Record<string, string> = {
  matematica: 'Matemática',
  fisica: 'Física',
  quimica: 'Química',
  biologia: 'Biologia',
  humanas: 'Humanas',
  linguagens: 'Linguagens',
};

const ACCENT_VARS: Record<string, string> = {
  matematica: '--accent-quiz',
  fisica: '--accent-simulado',
  quimica: '--accent-trilha',
  biologia: '--accent-jogos',
  humanas: '--accent-ranking',
  linguagens: '--accent-chat',
};

export interface DisciplineFrequencyItem {
  discipline: string;
  count: number;
}

export function QuizDisciplineFrequency({ data }: { data: DisciplineFrequencyItem[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  if (data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.count));

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-foreground">Frequência por disciplina</h2>
        <span className="text-xs text-muted-foreground">no banco</span>
      </div>
      <ul className="flex flex-col gap-2.5">
        {data.map((item) => {
          const label = DISCIPLINE_LABELS[item.discipline] ?? item.discipline;
          const accent = ACCENT_VARS[item.discipline] ?? '--accent-quiz';
          const pct = max > 0 ? (item.count / max) * 100 : 0;
          return (
            <li key={item.discipline} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">{label}</span>
                <span
                  className="font-mono tabular-nums text-muted-foreground"
                  title={`${item.count} questões`}
                >
                  {item.count}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-[width] duration-700 ease-out"
                  style={{
                    width: mounted ? `${pct}%` : '0%',
                    backgroundColor: `hsl(var(${accent}))`,
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
