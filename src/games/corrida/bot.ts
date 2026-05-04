export type CorridaSpeed = 'slow' | 'fast';

export class CorridaBot {
  speed: CorridaSpeed;

  constructor(speed: CorridaSpeed = 'slow') {
    this.speed = speed;
  }

  /** Returns units/sec relative to user's average speed. */
  speedFactor(): number {
    return this.speed === 'slow' ? 0.8 : 1.1;
  }

  /** Compute next bot position given dt (ms) and user's average speed. */
  step(currentPos: number, dtMs: number, userAvgSpeed: number): number {
    const factor = this.speedFactor();
    const delta = (userAvgSpeed * factor * dtMs) / 1000;
    return currentPos + delta;
  }
}
