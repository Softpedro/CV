// engine/TickLoop.ts — game loop sobre el ticker de Pixi.
// Reúne callbacks de update; entrega delta time en segundos.

import type { Application, Ticker } from 'pixi.js';

export type UpdateFn = (dt: number) => void;

export class TickLoop {
  private readonly app: Application;
  private readonly updates = new Set<UpdateFn>();
  private running = false;

  constructor(app: Application) {
    this.app = app;
  }

  /** Registra un callback de update. Devuelve la función para desuscribir. */
  onUpdate(fn: UpdateFn): () => void {
    this.updates.add(fn);
    return () => this.updates.delete(fn);
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.app.ticker.add(this.tick);
  }

  stop(): void {
    if (!this.running) return;
    this.running = false;
    this.app.ticker.remove(this.tick);
  }

  private tick = (ticker: Ticker): void => {
    // deltaMS en ms → segundos, cap para evitar saltos tras un stall/tab-out.
    const dt = Math.min(ticker.deltaMS / 1000, 1 / 20);
    for (const fn of this.updates) fn(dt);
  };
}
