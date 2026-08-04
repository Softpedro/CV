// engine/DropSystem.ts — la caza: detecta cuándo el jugador recoge un drop y lo emite.
// Espejo de Proximity: SOLO detecta; no toca el store ni sabe qué es un drop.
// El contenido decide qué hacer al recoger (contar, ocultar el sprite, etc.).
// Cada drop se recoge una sola vez (idempotente por id).

import type { Vec2 } from './types';

export type Unsub = () => void;

export interface DropPoint {
  id: string;
  pos: Vec2;
}

export class DropSystem {
  private readonly drops: DropPoint[];
  /** Radio (px) para "pisar" un drop y recogerlo. */
  private readonly radius: number;
  private readonly collected = new Set<string>();
  private readonly subs = new Set<(id: string) => void>();

  constructor(drops: DropPoint[], radius = 22) {
    this.drops = drops;
    this.radius = radius;
  }

  /** Se suscribe a cada recogida. Emite el id al recoger, una vez por drop. */
  subscribe(cb: (id: string) => void): Unsub {
    this.subs.add(cb);
    return () => this.subs.delete(cb);
  }

  /** Llamar cada frame con la posición del jugador. */
  update(point: Vec2): void {
    for (const d of this.drops) {
      if (this.collected.has(d.id)) continue;
      if (Math.hypot(point.x - d.pos.x, point.y - d.pos.y) <= this.radius) {
        this.collected.add(d.id);
        for (const cb of this.subs) cb(d.id);
      }
    }
  }
}
