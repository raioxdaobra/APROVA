'use client';

import { useEffect, useRef, useState } from 'react';
import { Brain, CheckCircle2, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GameShell } from '@/components/game-shell';
import { submitScore } from '@/lib/games/score-action';
import { cn } from '@/lib/utils';
import {
  calcLogicaScore,
  generateLogica,
  isSolved,
  type LogicaPuzzle,
} from './engine';

export default function LogicaGame() {
  const [puzzle, setPuzzle] = useState<LogicaPuzzle>(() => generateLogica());
  const [guess, setGuess] = useState<Record<string, string>[]>(
    () => puzzle.solution.map(() => ({})),
  );
  const [done, setDone] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const startedAtRef = useRef<number>(Date.now());

  const restart = () => {
    const p = generateLogica();
    setPuzzle(p);
    setGuess(p.solution.map(() => ({})));
    setDone(false);
    setSubmitted(false);
    setHintsUsed(0);
    startedAtRef.current = Date.now();
  };

  const setCell = (house: number, cat: string, val: string) => {
    setGuess((g) => {
      const ng = g.map((r) => ({ ...r }));
      ng[house]![cat] = val;
      return ng;
    });
  };

  const onHint = () => {
    // Reveal one random uncompleted cell.
    const candidates: Array<[number, string]> = [];
    for (let i = 0; i < 4; i++) {
      for (const cat of puzzle.categories) {
        if (guess[i]?.[cat] !== puzzle.solution[i]![cat]) {
          candidates.push([i, cat]);
        }
      }
    }
    if (candidates.length === 0) return;
    const pick = candidates[Math.floor(Math.random() * candidates.length)]!;
    setCell(pick[0], pick[1], puzzle.solution[pick[0]]![pick[1]]!);
    setHintsUsed((h) => h + 1);
  };

  useEffect(() => {
    if (done) return;
    if (isSolved(guess, puzzle.solution)) setDone(true);
  }, [guess, puzzle.solution, done]);

  useEffect(() => {
    if (!done || submitted) return;
    setSubmitted(true);
    const durationMs = Date.now() - startedAtRef.current;
    void submitScore({
      gameId: 'logica',
      score: calcLogicaScore(durationMs, hintsUsed),
      durationMs,
      meta: { hintsUsed },
    });
  }, [done, submitted, hintsUsed]);

  const finalScore = done
    ? calcLogicaScore(Date.now() - startedAtRef.current, hintsUsed)
    : null;

  return (
    <GameShell
      title="Quebra-cabeça Lógico"
      subtitle="Use as dicas pra preencher cada casa"
      onRestart={restart}
      finalScore={finalScore}
      instructions={{
        gameId: 'logica',
        title: 'Charadas Lógicas',
        subtitle: 'Enigmas curtos pra esquentar o raciocínio',
        icon: '🧩',
        rules: [
          'Você recebe uma tabela com pessoas/itens/categorias e várias dicas verbais.',
          'Cada dica elimina ou confirma combinações possíveis.',
          'Marque os cruzamentos certos baseado nas dicas até a tabela ficar consistente.',
          'Quanto mais rápido resolver e menos dicas usar, maior a pontuação.',
          'Não há erro fatal — você pode reanalizar e ajustar antes de confirmar.',
        ],
      }}
      hud={
        <span className="rounded-full bg-card px-2 py-1 text-xs">
          <Brain className="mr-1 inline h-3 w-3" />
          {puzzle.clues.length} dicas
        </span>
      }
    >
      <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[1fr_320px]">
        <div className="overflow-x-auto rounded-xl border border-border/60 bg-card/60 p-4 shadow-xl">
          <table className="w-full border-collapse text-xs sm:text-sm">
            <thead>
              <tr>
                <th className="border-b border-border p-2 text-left text-muted-foreground">
                  Casa
                </th>
                {puzzle.categories.map((cat) => (
                  <th
                    key={cat}
                    className="border-b border-border p-2 text-left font-semibold"
                  >
                    {cat}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[0, 1, 2, 3].map((h) => (
                <tr key={h}>
                  <td className="border-b border-border p-2 font-bold text-primary">
                    {h + 1}
                  </td>
                  {puzzle.categories.map((cat) => (
                    <td key={cat} className="border-b border-border p-1">
                      <select
                        value={guess[h]?.[cat] ?? ''}
                        onChange={(e) => setCell(h, cat, e.target.value)}
                        className={cn(
                          'w-full rounded-md border border-border bg-background px-2 py-1 text-xs sm:text-sm',
                          guess[h]?.[cat] === puzzle.solution[h]![cat] &&
                            'border-emerald-500/60 bg-emerald-500/10',
                        )}
                      >
                        <option value="">—</option>
                        {puzzle.values[cat]!.map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Dicas usadas: <strong>{hintsUsed}</strong>
            </span>
            <Button variant="secondary" size="sm" onClick={onHint}>
              <Lightbulb className="mr-2 h-4 w-4" />
              Revelar uma célula
            </Button>
          </div>

          {done ? (
            <div className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-bold">Você desvendou o enigma!</span>
            </div>
          ) : null}
        </div>

        <aside className="rounded-xl border border-border/60 bg-card/40 p-4 backdrop-blur">
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-primary">
            Dicas
          </h3>
          <ol className="space-y-2 text-sm">
            {puzzle.clues.map((clue, i) => (
              <li
                key={i}
                className="flex gap-2 rounded-md border border-border/40 bg-background p-2"
              >
                <span className="font-mono text-xs text-muted-foreground">
                  {String(i + 1).padStart(2, '0')}.
                </span>
                <span>{clue}</span>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </GameShell>
  );
}
