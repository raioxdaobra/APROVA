'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Eraser, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GameShell } from '@/components/game-shell';
import { submitScore } from '@/lib/games/score-action';
import { cn } from '@/lib/utils';
import {
  calcSudokuScore,
  checkSolution,
  generatePuzzle,
  isComplete,
  isValid,
  type SudokuDifficulty,
} from './engine';

const DIFFS: SudokuDifficulty[] = ['easy', 'medium', 'hard'];
const DIFF_LABEL: Record<SudokuDifficulty, string> = {
  easy: 'Fácil',
  medium: 'Médio',
  hard: 'Difícil',
};

export default function SudokuGame() {
  const [difficulty, setDifficulty] = useState<SudokuDifficulty>('easy');
  const [puzzle, setPuzzle] = useState(() => generatePuzzle('easy'));
  const [grid, setGrid] = useState<number[][]>(() =>
    puzzle.given.map((r) => r.slice()),
  );
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [done, setDone] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const startedAtRef = useRef<number>(Date.now());

  const restart = () => {
    const p = generatePuzzle(difficulty);
    setPuzzle(p);
    setGrid(p.given.map((r) => r.slice()));
    setSelected(null);
    setHintsUsed(0);
    setDone(false);
    setSubmitted(false);
    startedAtRef.current = Date.now();
  };

  // When difficulty changes, regenerate.
  useEffect(() => {
    restart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  const conflicts = useMemo(() => {
    const set = new Set<string>();
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const v = grid[r]![c];
        if (v === undefined || v === 0) continue;
        // Temporarily zero & check
        grid[r]![c] = 0;
        if (!isValid(grid, r, c, v)) {
          set.add(`${r},${c}`);
        }
        grid[r]![c] = v;
      }
    }
    return set;
  }, [grid]);

  const onSetValue = (val: number) => {
    if (!selected || done) return;
    const [r, c] = selected;
    if (puzzle.given[r]![c] !== 0) return;
    setGrid((g) => {
      const ng = g.map((row) => row.slice());
      ng[r]![c] = val;
      return ng;
    });
  };

  const onHint = () => {
    if (!selected || done) return;
    const [r, c] = selected;
    if (puzzle.given[r]![c] !== 0) return;
    setGrid((g) => {
      const ng = g.map((row) => row.slice());
      ng[r]![c] = puzzle.solution[r]![c]!;
      return ng;
    });
    setHintsUsed((h) => h + 1);
  };

  // Check completion.
  useEffect(() => {
    if (done) return;
    if (isComplete(grid) && checkSolution(grid, puzzle.solution)) {
      setDone(true);
    }
  }, [grid, puzzle.solution, done]);

  // Submit score.
  useEffect(() => {
    if (!done || submitted) return;
    setSubmitted(true);
    const durationMs = Date.now() - startedAtRef.current;
    const baseScore = calcSudokuScore(durationMs, difficulty);
    const penalty = hintsUsed * 200;
    const score = Math.max(0, baseScore - penalty);
    void submitScore({
      gameId: 'sudoku',
      score,
      durationMs,
      meta: { difficulty, hintsUsed },
    });
  }, [done, submitted, difficulty, hintsUsed]);

  const finalScore = done
    ? Math.max(
        0,
        calcSudokuScore(Date.now() - startedAtRef.current, difficulty) -
          hintsUsed * 200,
      )
    : null;

  return (
    <GameShell
      title="Sudoku"
      subtitle="Preencha o grid 9x9"
      onRestart={restart}
      finalScore={finalScore}
      hud={
        <div className="flex items-center gap-2 text-xs">
          {DIFFS.map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={cn(
                'rounded-full border px-2 py-0.5',
                difficulty === d
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/40',
              )}
            >
              {DIFF_LABEL[d]}
            </button>
          ))}
        </div>
      }
    >
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-5">
        <div
          className="grid select-none gap-0 rounded-lg border-2 border-foreground/80 bg-card p-1 shadow-xl"
          style={{ gridTemplateColumns: 'repeat(9, minmax(0, 1fr))' }}
        >
          {grid.map((row, r) =>
            row.map((v, c) => {
              const isGiven = puzzle.given[r]![c] !== 0;
              const isSel = selected && selected[0] === r && selected[1] === c;
              const isPeer =
                selected &&
                (selected[0] === r ||
                  selected[1] === c ||
                  (Math.floor(selected[0] / 3) === Math.floor(r / 3) &&
                    Math.floor(selected[1] / 3) === Math.floor(c / 3)));
              const isConflict = conflicts.has(`${r},${c}`);
              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => setSelected([r, c])}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center text-lg font-bold sm:h-12 sm:w-12 sm:text-xl',
                    'border border-border/40 transition-colors',
                    // Thicker borders every 3
                    c % 3 === 2 && c !== 8 && 'border-r-2 border-r-foreground/70',
                    r % 3 === 2 && r !== 8 && 'border-b-2 border-b-foreground/70',
                    isGiven ? 'bg-muted text-foreground' : 'bg-card text-primary',
                    isPeer && !isSel && 'bg-primary/5',
                    isSel && 'bg-primary/30 ring-2 ring-primary',
                    isConflict && 'bg-rose-500/30 text-rose-600',
                  )}
                >
                  {v === 0 ? '' : v}
                </button>
              );
            }),
          )}
        </div>

        <div className="grid grid-cols-9 gap-1 sm:gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <Button
              key={n}
              variant="secondary"
              onClick={() => onSetValue(n)}
              className="h-12 w-10 text-lg sm:w-12 sm:text-xl"
            >
              {n}
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => onSetValue(0)}>
            <Eraser className="mr-2 h-4 w-4" /> Limpar
          </Button>
          <Button variant="secondary" onClick={onHint}>
            <Lightbulb className="mr-2 h-4 w-4" /> Dica ({hintsUsed})
          </Button>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-2 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            <h2 className="text-xl font-bold">Resolvido!</h2>
            <p className="text-sm text-muted-foreground">
              {hintsUsed} dica{hintsUsed === 1 ? '' : 's'} usada
              {hintsUsed === 1 ? '' : 's'}
            </p>
          </div>
        ) : null}
      </div>
    </GameShell>
  );
}
