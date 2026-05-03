/**
 * "Sons" base do APROVA. Para evitar empurrar arquivos OGG/MP3 de KBs no
 * bundle (e seus problemas de licenciamento + carregamento), os sons são
 * sintetizados em runtime via Web Audio API a partir de descritores de
 * envelope/ondas pequenas. O resultado fica abaixo de 5KB cada quando
 * "renderizado" e o bundle só carrega esses descritores (~200B totais).
 *
 * Os exports `correctSound` / `wrongSound` / `levelUpSound` / `badgeSound`
 * são consumidos por `player.ts`.
 */

export interface ToneStep {
  freq: number; // Hz
  duration: number; // segundos
  type?: OscillatorType; // default 'sine'
  gain?: number; // 0..1, default 0.18
  glide?: number; // se setado, freq final ao longo da duração
}

export interface SoundDescriptor {
  steps: ToneStep[];
}

// Acerto: ding curto subindo (C5 → E5 → G5)
export const correctSound: SoundDescriptor = {
  steps: [
    { freq: 523.25, duration: 0.07, type: 'sine', gain: 0.18 },
    { freq: 659.25, duration: 0.07, type: 'sine', gain: 0.18 },
    { freq: 783.99, duration: 0.14, type: 'sine', gain: 0.2 },
  ],
};

// Erro: tum baixo curto (A2 → F2)
export const wrongSound: SoundDescriptor = {
  steps: [
    { freq: 110, duration: 0.18, type: 'triangle', gain: 0.16, glide: 87.31 },
  ],
};

// Level up: melodia ascendente (C5 → E5 → G5 → C6)
export const levelUpSound: SoundDescriptor = {
  steps: [
    { freq: 523.25, duration: 0.1, type: 'square', gain: 0.14 },
    { freq: 659.25, duration: 0.1, type: 'square', gain: 0.15 },
    { freq: 783.99, duration: 0.1, type: 'square', gain: 0.16 },
    { freq: 1046.5, duration: 0.22, type: 'square', gain: 0.18 },
  ],
};

// Badge: chime brilhante (G5 + B5 + D6 simulado por arpejo rápido)
export const badgeSound: SoundDescriptor = {
  steps: [
    { freq: 783.99, duration: 0.08, type: 'sine', gain: 0.18 },
    { freq: 987.77, duration: 0.08, type: 'sine', gain: 0.18 },
    { freq: 1174.66, duration: 0.18, type: 'sine', gain: 0.2 },
  ],
};

export type SoundName = 'correct' | 'wrong' | 'levelUp' | 'badge';

export const SOUNDS: Record<SoundName, SoundDescriptor> = {
  correct: correctSound,
  wrong: wrongSound,
  levelUp: levelUpSound,
  badge: badgeSound,
};
