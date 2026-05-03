/**
 * AudioPlayer — toca os sons sintetizados em `sounds.ts` via Web Audio API.
 *
 * Regras:
 *  - Respeita `prefers-reduced-motion: reduce` → mute.
 *  - Respeita `localStorage.aprova-sounds` ('on' | 'off').
 *  - Default por dispositivo: ON em mobile (matchMedia max-width 768px),
 *    OFF em desktop. Se o user setou explicitamente, vale o setting.
 *  - SSR-safe: tudo inicializa lazy no primeiro `play()`.
 */

import { SOUNDS, type SoundName, type SoundDescriptor } from './sounds';

const STORAGE_KEY = 'aprova-sounds';

type Pref = 'on' | 'off';

function readPref(): Pref | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v === 'on' || v === 'off') return v;
    return null;
  } catch {
    return null;
  }
}

function detectDefault(): Pref {
  if (typeof window === 'undefined') return 'off';
  try {
    return window.matchMedia('(max-width: 768px)').matches ? 'on' : 'off';
  } catch {
    return 'off';
  }
}

export function getSoundPreference(): Pref {
  return readPref() ?? detectDefault();
}

export function setSoundPreference(pref: Pref): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, pref);
  } catch {
    /* noop */
  }
}

function reducedMotionActive(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

export class AudioPlayer {
  private ctx: AudioContext | null = null;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (this.ctx) return this.ctx;
    const Ctor =
      (window as unknown as { AudioContext?: typeof AudioContext }).AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    try {
      this.ctx = new Ctor();
    } catch {
      this.ctx = null;
    }
    return this.ctx;
  }

  private playDescriptor(desc: SoundDescriptor) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    let t = ctx.currentTime;
    for (const step of desc.steps) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = step.type ?? 'sine';
      osc.frequency.setValueAtTime(step.freq, t);
      if (typeof step.glide === 'number') {
        osc.frequency.exponentialRampToValueAtTime(
          Math.max(step.glide, 1),
          t + step.duration,
        );
      }
      // envelope ADSR muito simples: ataque 8ms, release 30ms
      const peak = step.gain ?? 0.18;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(peak, t + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + step.duration);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + step.duration + 0.02);
      t += step.duration;
    }
  }

  /**
   * Toca o som identificado por `name`. Não faz nada se a preferência
   * estiver `off`, se o usuário pediu prefers-reduced-motion, ou se o
   * Web Audio não estiver disponível.
   */
  play(name: SoundName): void {
    if (typeof window === 'undefined') return;
    if (reducedMotionActive()) return;
    if (getSoundPreference() === 'off') return;
    const desc = SOUNDS[name];
    if (!desc) return;
    try {
      this.playDescriptor(desc);
    } catch {
      /* noop */
    }
  }
}

let singleton: AudioPlayer | null = null;
export function getAudioPlayer(): AudioPlayer {
  if (!singleton) singleton = new AudioPlayer();
  return singleton;
}
