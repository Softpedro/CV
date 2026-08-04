// world/AvatarController.ts — puente input → movimiento.
// Toma la dirección del Input y la pasa por MovementTransport (la costura).
// No toca la posición del Player directo: ese es el contrato que permite
// swapear LocalTransport por NetworkTransport sin cambiar nada acá.

import type { Input } from '../engine';
import type { MovementTransport } from './movement/MovementTransport';

export class AvatarController {
  private readonly input: Input;
  private readonly transport: MovementTransport;

  constructor(input: Input, transport: MovementTransport) {
    this.input = input;
    this.transport = transport;
  }

  /** Llamar cada frame desde el TickLoop. */
  update(dt: number): void {
    this.transport.applyLocalInput(this.input.direction(), dt);
  }
}
