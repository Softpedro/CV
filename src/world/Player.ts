// world/Player.ts — la entidad jugador. Solo datos: posición, dirección, estado.
// No se mueve a sí misma; el MovementTransport integra su posición.

import type { Vec2 } from '../engine';

/** Las 4 direcciones cardinales del avatar (idle/walk por dir). */
export type Facing = 'up' | 'down' | 'left' | 'right';

export class Player {
  /** Posición en píxeles de mundo (los pies del avatar). */
  pos: Vec2;
  /** Hacia dónde mira; persiste cuando está quieto. */
  facing: Facing = 'down';
  /** true mientras recibe input de movimiento este frame. */
  moving = false;
  /** Velocidad en px de mundo por segundo. */
  speed: number;

  constructor(spawn: Vec2, speed = 160) {
    this.pos = { ...spawn };
    this.speed = speed;
  }
}
