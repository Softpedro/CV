// engine/Colliders.ts — colisionadores genéricos que se combinan con el del mapa.
// El TileMap resuelve la grilla; esto cubre lo que no vive en la grilla (props,
// edificios, vallas). Genérico: no conoce DROPE, solo rects de mundo.

import type { Collider, WorldRect } from './types';

/** ¿Se solapan dos rects? Tocarse por el borde NO cuenta como solaparse: así una
 * entidad puede quedar apoyada justo contra un sólido sin trabarse contra él. */
export function rectsOverlap(a: WorldRect, b: WorldRect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

/** Colisión contra una lista fija de rects. Pensado para pocos sólidos (decenas):
 * hace un barrido lineal, sin índice espacial. */
export class RectsCollider implements Collider {
  private readonly rects: readonly WorldRect[];

  constructor(rects: readonly WorldRect[]) {
    this.rects = rects;
  }

  hits(rect: WorldRect): boolean {
    for (const r of this.rects) if (rectsOverlap(rect, r)) return true;
    return false;
  }
}

/** Une varios colliders en uno: es sólido si CUALQUIERA de ellos lo es. */
export class CompositeCollider implements Collider {
  private readonly parts: readonly Collider[];

  constructor(...parts: Collider[]) {
    this.parts = parts;
  }

  hits(rect: WorldRect): boolean {
    for (const p of this.parts) if (p.hits(rect)) return true;
    return false;
  }
}
