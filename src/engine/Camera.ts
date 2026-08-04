// engine/Camera.ts — sigue un objetivo y lo clampa a los límites del mundo.
// Traduce coordenadas de mundo → pantalla desplazando el contenedor `world`.

import type { Container } from 'pixi.js';
import type { Vec2, WorldRect } from './types';
import { vec } from './types';

export class Camera {
  /** Punto del mundo que la cámara centra (px de mundo). */
  target: Vec2 = { x: 0, y: 0 };
  /** Límites del mundo; la cámara no muestra fuera de acá. */
  bounds: WorldRect;
  /** 0..1 — suavizado del seguimiento (1 = pega instantáneo). */
  lerp = 0.15;

  private readonly world: Container;
  private pos: Vec2 = { x: 0, y: 0 };

  constructor(world: Container, bounds: WorldRect) {
    this.world = world;
    this.bounds = bounds;
  }

  /** Fija el centro sin suavizado (spawn inicial). */
  snapTo(p: Vec2): void {
    this.target = { ...p };
    this.pos = { ...p };
  }

  /** Llamar cada frame. `viewport` en px CSS. */
  update(viewport: { w: number; h: number }): void {
    // Suavizado hacia el objetivo.
    this.pos.x += (this.target.x - this.pos.x) * this.lerp;
    this.pos.y += (this.target.y - this.pos.y) * this.lerp;

    const halfW = viewport.w / 2;
    const halfH = viewport.h / 2;

    // Clamp: el centro no puede salir de [bounds + medio viewport].
    // Si el mundo es más chico que el viewport, se centra.
    const minX = this.bounds.x + halfW;
    const maxX = this.bounds.x + this.bounds.w - halfW;
    const minY = this.bounds.y + halfH;
    const maxY = this.bounds.y + this.bounds.h - halfH;

    const cx = maxX >= minX ? vec.clamp(this.pos.x, minX, maxX) : this.bounds.x + this.bounds.w / 2;
    const cy = maxY >= minY ? vec.clamp(this.pos.y, minY, maxY) : this.bounds.y + this.bounds.h / 2;

    // Desplaza el mundo para que (cx, cy) quede en el centro de la pantalla.
    this.world.position.set(Math.round(halfW - cx), Math.round(halfH - cy));
  }
}
