// engine/types.ts — tipos genéricos del motor. Nada de DROPE acá.

export type Vec2 = { x: number; y: number };
export type WorldRect = { x: number; y: number; w: number; h: number };
export type SpriteRef = string; // clave del atlas de sprites

// Tokens de color del Style Bible. El engine solo conoce sus nombres/valores.
export type PaletteColor = 'ink' | 'paper' | 'violet' | 'lime' | 'aqua' | 'coral';

// Algo con lo que se puede colisionar (lo implementa TileMap). El movimiento
// (world/) lo consume por esta interfaz, sin conocer cómo está hecho el mapa.
export interface Collider {
  /** true si el rect (px de mundo) toca algo sólido. */
  hits(rect: WorldRect): boolean;
}

// Zona nombrada del mundo. Proximity mide cercanía; el contenido decide qué es.
export interface Zone {
  id: string;
  rect: WorldRect;
}

export const PALETTE: Record<PaletteColor, number> = {
  ink: 0x0f0f16,
  paper: 0xf5f2ea,
  violet: 0x6e56f8,
  lime: 0xc7ff4d,
  aqua: 0x25e0c8,
  coral: 0xff6b5b,
};

// Utilidades de vector puras (sin dependencias).
export const vec = {
  zero(): Vec2 {
    return { x: 0, y: 0 };
  },
  len(v: Vec2): number {
    return Math.hypot(v.x, v.y);
  },
  normalize(v: Vec2): Vec2 {
    const l = Math.hypot(v.x, v.y);
    return l === 0 ? { x: 0, y: 0 } : { x: v.x / l, y: v.y / l };
  },
  clamp(value: number, min: number, max: number): number {
    return value < min ? min : value > max ? max : value;
  },
};
