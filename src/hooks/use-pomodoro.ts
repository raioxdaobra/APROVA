'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { incrementFocusMinutes } from '@/app/jogos/actions';

export type PomodoroPhase = 'focus' | 'break';

const FOCUS_SEC = 25 * 60;
const BREAK_SEC = 5 * 60;
const FOCUS_MIN = 25;

/** Evento global emitido quando um ciclo de foco termina. */
export const FOCUS_COMPLETE_EVENT = 'aprova:focus-complete';

export interface FocusCompleteDetail {
  /** Total acumulado de minutos focados hoje (após o incremento). */
  totalToday: number;
  /** Minutos creditados pelo ciclo que acabou de fechar. */
  minutesCredited: number;
}

const STORAGE_KEY = 'aprova-pomodoro-state';

interface StoredState {
  phase: PomodoroPhase;
  /** Timestamp ms quando a fase atual termina (apenas relevante quando running). */
  endsAt: number | null;
  /** Segundos restantes congelados quando pausado. */
  remainingSec: number;
  running: boolean;
  cycles: number;
}

const DEFAULT_STATE: StoredState = {
  phase: 'focus',
  endsAt: null,
  remainingSec: FOCUS_SEC,
  running: false,
  cycles: 0,
};

function loadState(): StoredState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<StoredState>;
    return {
      phase: parsed.phase === 'break' ? 'break' : 'focus',
      endsAt: typeof parsed.endsAt === 'number' ? parsed.endsAt : null,
      remainingSec:
        typeof parsed.remainingSec === 'number'
          ? parsed.remainingSec
          : parsed.phase === 'break'
            ? BREAK_SEC
            : FOCUS_SEC,
      running: parsed.running === true,
      cycles: typeof parsed.cycles === 'number' ? parsed.cycles : 0,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(state: StoredState) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignora
  }
}

function phaseLength(phase: PomodoroPhase): number {
  return phase === 'focus' ? FOCUS_SEC : BREAK_SEC;
}

export interface UsePomodoroResult {
  phase: PomodoroPhase;
  running: boolean;
  /** Segundos restantes na fase atual (recalculado a cada tick). */
  remainingSec: number;
  cycles: number;
  start: () => void;
  pause: () => void;
  toggle: () => void;
  reset: () => void;
}

export function usePomodoro(): UsePomodoroResult {
  const [state, setState] = useState<StoredState>(DEFAULT_STATE);
  const [, setTick] = useState(0); // força rerender no tick
  const initializedRef = useRef(false);

  // Hidrata do localStorage no mount (SSR safe)
  useEffect(() => {
    setState(loadState());
    initializedRef.current = true;
  }, []);

  // Persiste mudanças
  useEffect(() => {
    if (!initializedRef.current) return;
    saveState(state);
  }, [state]);

  // Tick (somente quando running)
  useEffect(() => {
    if (!state.running) return;
    const id = window.setInterval(() => {
      setTick((t) => (t + 1) % 1_000_000);
    }, 1000);
    return () => window.clearInterval(id);
  }, [state.running]);

  // Calcula remaining em tempo real
  const computedRemaining = (() => {
    if (!state.running) return state.remainingSec;
    if (state.endsAt === null) return state.remainingSec;
    return Math.max(0, Math.ceil((state.endsAt - Date.now()) / 1000));
  })();

  // Auto-transição quando chega a 0
  useEffect(() => {
    if (!state.running) return;
    if (computedRemaining > 0) return;
    const endingPhase = state.phase;
    setState((prev) => {
      const nextPhase: PomodoroPhase = prev.phase === 'focus' ? 'break' : 'focus';
      const nextLen = phaseLength(nextPhase);
      const nextCycles = prev.phase === 'break' ? prev.cycles + 1 : prev.cycles;
      return {
        phase: nextPhase,
        running: true,
        endsAt: Date.now() + nextLen * 1000,
        remainingSec: nextLen,
        cycles: nextCycles,
      };
    });
    // Vibração suave na transição
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([60, 40, 60]);
    }
    // Quando um ciclo de FOCO termina, credita 25 min em daily_focus_minutes
    // e dispara evento global pra UI sugerir descanso/jogos.
    if (endingPhase === 'focus') {
      void incrementFocusMinutes(FOCUS_MIN)
        .then((res) => {
          if (typeof window === 'undefined') return;
          const detail: FocusCompleteDetail = {
            totalToday: res.totalToday,
            minutesCredited: FOCUS_MIN,
          };
          window.dispatchEvent(
            new CustomEvent<FocusCompleteDetail>(FOCUS_COMPLETE_EVENT, { detail }),
          );
        })
        .catch(() => {
          // Falha silenciosa — graceful (offline, sessão expirada, etc).
          if (typeof window === 'undefined') return;
          const detail: FocusCompleteDetail = {
            totalToday: 0,
            minutesCredited: FOCUS_MIN,
          };
          window.dispatchEvent(
            new CustomEvent<FocusCompleteDetail>(FOCUS_COMPLETE_EVENT, { detail }),
          );
        });
    }
  }, [computedRemaining, state.running, state.phase]);

  const start = useCallback(() => {
    setState((prev) => {
      if (prev.running) return prev;
      const remaining =
        prev.remainingSec > 0 ? prev.remainingSec : phaseLength(prev.phase);
      return {
        ...prev,
        running: true,
        endsAt: Date.now() + remaining * 1000,
        remainingSec: remaining,
      };
    });
  }, []);

  const pause = useCallback(() => {
    setState((prev) => {
      if (!prev.running) return prev;
      const remaining =
        prev.endsAt !== null
          ? Math.max(0, Math.ceil((prev.endsAt - Date.now()) / 1000))
          : prev.remainingSec;
      return {
        ...prev,
        running: false,
        endsAt: null,
        remainingSec: remaining,
      };
    });
  }, []);

  const toggle = useCallback(() => {
    setState((prev) => {
      if (prev.running) {
        const remaining =
          prev.endsAt !== null
            ? Math.max(0, Math.ceil((prev.endsAt - Date.now()) / 1000))
            : prev.remainingSec;
        return { ...prev, running: false, endsAt: null, remainingSec: remaining };
      }
      const remaining =
        prev.remainingSec > 0 ? prev.remainingSec : phaseLength(prev.phase);
      return {
        ...prev,
        running: true,
        endsAt: Date.now() + remaining * 1000,
        remainingSec: remaining,
      };
    });
  }, []);

  const reset = useCallback(() => {
    setState({
      phase: 'focus',
      running: false,
      endsAt: null,
      remainingSec: FOCUS_SEC,
      cycles: 0,
    });
  }, []);

  return {
    phase: state.phase,
    running: state.running,
    remainingSec: computedRemaining,
    cycles: state.cycles,
    start,
    pause,
    toggle,
    reset,
  };
}
