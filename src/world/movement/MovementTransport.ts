// world/movement/MovementTransport.ts — LA COSTURA del multiplayer.
// Todo movimiento pasa por esta interfaz, nunca directo sobre el Player.
// Fase 0: LocalTransport. Fase 3: NetworkTransport, misma interfaz.
// Al cambiar la implementación, el AvatarController y la UI no se tocan.

import type { Vec2 } from '../../engine';

/** Estado de un peer remoto (otros avatares). Vacío en Fase 0. */
export type PeerState = { id: string; pos: Vec2; dir: string; label?: string };

export type Unsub = () => void;

export interface MovementTransport {
  /** Aplica el input local de este frame (integra la posición del jugador). */
  applyLocalInput(dir: Vec2, dt: number): void;
  /** Se suscribe a los peers remotos. En Fase 0 nunca emite. */
  subscribeRemote(cb: (peers: PeerState[]) => void): Unsub;
}
