// engine/Proximity.ts — detecta a qué zona está más cerca un punto y lo emite.
// SOLO detecta y notifica; no abre paneles ni sabe qué es una zona.
// El contenido (content/) decide qué hacer cuando cambia la zona activa.

import type { Vec2, Zone } from './types';

export type Unsub = () => void;

export class Proximity {
  private readonly zones: Zone[];
  /** Distancia máx (px) para considerar una zona "activa". */
  private readonly radius: number;
  private currentId: string | null = null;
  private readonly subs = new Set<(id: string | null) => void>();

  constructor(zones: Zone[], radius = 600) {
    this.zones = zones;
    this.radius = radius;
  }

  /** Zona activa actual (o null si ninguna dentro del radio). */
  get nearest(): string | null {
    return this.currentId;
  }

  /** Se suscribe a los cambios de zona. Emite al cambiar, no cada frame. */
  subscribe(cb: (id: string | null) => void): Unsub {
    this.subs.add(cb);
    cb(this.currentId); // estado inicial
    return () => this.subs.delete(cb);
  }

  /** Llamar cada frame con la posición del jugador. */
  update(point: Vec2): void {
    let bestId: string | null = null;
    let bestDist = Infinity;
    for (const z of this.zones) {
      const d = distToRect(point, z);
      if (d < bestDist) {
        bestDist = d;
        bestId = z.id;
      }
    }
    const next = bestDist <= this.radius ? bestId : null;
    if (next !== this.currentId) {
      this.currentId = next;
      for (const cb of this.subs) cb(next);
    }
  }
}

/** Distancia de un punto a un rect (0 si está dentro). */
function distToRect(p: Vec2, z: Zone): number {
  const { rect } = z;
  const dx = Math.max(rect.x - p.x, 0, p.x - (rect.x + rect.w));
  const dy = Math.max(rect.y - p.y, 0, p.y - (rect.y + rect.h));
  return Math.hypot(dx, dy);
}
