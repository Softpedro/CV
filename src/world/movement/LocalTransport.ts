// world/movement/LocalTransport.ts — Fase 0: movimiento local puro.
// Integra la posición del jugador a partir del input, la clampa al mundo,
// resuelve colisión contra un Collider (por-eje, para deslizar en los muros)
// y deriva el facing. No hay red ni peers: subscribeRemote nunca emite.

import type { Vec2, WorldRect, Collider } from '../../engine';
import { vec } from '../../engine';
import type { Player, Facing } from '../Player';
import type { MovementTransport, PeerState, Unsub } from './MovementTransport';

// Caja de colisión del avatar, alrededor de los pies (pos = pies).
const BOX_HALF_W = 7;
const BOX_TOP = 8; // sube desde pos
const BOX_BOTTOM = 4; // baja desde pos

function feetBox(x: number, y: number): WorldRect {
  return { x: x - BOX_HALF_W, y: y - BOX_TOP, w: BOX_HALF_W * 2, h: BOX_TOP + BOX_BOTTOM };
}

export class LocalTransport implements MovementTransport {
  private readonly player: Player;
  private readonly bounds: WorldRect;
  private readonly collider?: Collider;

  constructor(player: Player, bounds: WorldRect, collider?: Collider) {
    this.player = player;
    this.bounds = bounds;
    this.collider = collider;
  }

  applyLocalInput(dir: Vec2, dt: number): void {
    const { player, bounds, collider } = this;

    if (dir.x === 0 && dir.y === 0) {
      player.moving = false; // quieto: conserva el último facing
      return;
    }

    const step = player.speed * dt;

    // Movimiento por-eje: si un eje choca, se revierte solo ese (desliza).
    const nx = vec.clamp(player.pos.x + dir.x * step, bounds.x, bounds.x + bounds.w);
    if (!collider || !collider.hits(feetBox(nx, player.pos.y))) player.pos.x = nx;

    const ny = vec.clamp(player.pos.y + dir.y * step, bounds.y, bounds.y + bounds.h);
    if (!collider || !collider.hits(feetBox(player.pos.x, ny))) player.pos.y = ny;

    player.facing = facingFromDir(dir, player.facing);
    player.moving = true;
  }

  subscribeRemote(_cb: (peers: PeerState[]) => void): Unsub {
    // Fase 0: un solo habitante. Se enchufa en Fase 3 con NetworkTransport.
    return () => {};
  }
}

/** Eje dominante → dirección cardinal. Empata a favor del vertical. */
function facingFromDir(dir: Vec2, prev: Facing): Facing {
  if (Math.abs(dir.x) > Math.abs(dir.y)) return dir.x > 0 ? 'right' : 'left';
  if (Math.abs(dir.y) > 0) return dir.y > 0 ? 'down' : 'up';
  return prev;
}
