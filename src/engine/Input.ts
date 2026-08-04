// engine/Input.ts — teclado + táctil normalizados a un Vec2 de dirección.
// El resto del sistema solo pregunta `direction()`; no conoce las teclas.

import type { Vec2 } from './types';
import { vec } from './types';

const KEY_MAP: Record<string, keyof typeof AXES> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  s: 'down',
  a: 'left',
  d: 'right',
  W: 'up',
  S: 'down',
  A: 'left',
  D: 'right',
};

const AXES = { up: false, down: false, left: false, right: false };

export class Input {
  private keys = { ...AXES };
  /** Dirección del joystick táctil (ya normalizada), o null si no hay touch. */
  private touch: Vec2 | null = null;
  private readonly target: HTMLElement;

  constructor(target: HTMLElement) {
    this.target = target;
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.reset);
  }

  /** Dirección actual normalizada. (0,0) si no hay input. */
  direction(): Vec2 {
    if (this.touch) return this.touch;
    const d: Vec2 = {
      x: (this.keys.right ? 1 : 0) - (this.keys.left ? 1 : 0),
      y: (this.keys.down ? 1 : 0) - (this.keys.up ? 1 : 0),
    };
    return vec.normalize(d);
  }

  /** El overlay táctil (React) empuja aquí su vector -1..1. */
  setTouch(dir: Vec2 | null): void {
    this.touch = dir ? vec.normalize(dir) : null;
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    const axis = KEY_MAP[e.key];
    if (!axis) return;
    this.keys[axis] = true;
    e.preventDefault();
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    const axis = KEY_MAP[e.key];
    if (!axis) return;
    this.keys[axis] = false;
  };

  private reset = (): void => {
    this.keys = { ...AXES };
    this.touch = null;
  };

  destroy(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.reset);
    // referencia usada para posibles listeners futuros sobre el canvas
    void this.target;
  }
}
