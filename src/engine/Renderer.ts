// engine/Renderer.ts — inicializa PIXI.Application y las capas del mundo.
// Genérico: no sabe qué se dibuja, solo dónde. La cámara mueve `world`.

import { Application, Container } from 'pixi.js';
import { PALETTE } from './types';

export interface Layers {
  /** Piso, tilemap. Se pinta primero. */
  floor: Container;
  /** Entidades: avatar, drops, props. */
  entities: Container;
  /** Sobrecapa dentro del mundo (glow, sombras altas). */
  overlay: Container;
}

export class Renderer {
  readonly app: Application;
  /** Contenedor que la cámara desplaza. Todo lo "del mundo" cuelga de acá. */
  readonly world: Container;
  /** Capa fija a pantalla (HUD dibujado en Pixi, si hiciera falta). */
  readonly screen: Container;
  readonly layers: Layers;

  private constructor(
    app: Application,
    world: Container,
    screen: Container,
    layers: Layers,
  ) {
    this.app = app;
    this.world = world;
    this.screen = screen;
    this.layers = layers;
  }

  static async create(mount: HTMLElement): Promise<Renderer> {
    const app = new Application();
    await app.init({
      background: PALETTE.ink,
      resizeTo: mount,
      antialias: false, // pixel-art: nearest-neighbor, cero antialiasing
      roundPixels: true,
      autoDensity: true,
      resolution: window.devicePixelRatio || 1,
    });

    // El canvas se agrega al nodo de montaje que nos pasa React.
    mount.appendChild(app.canvas);

    const world = new Container();
    const screen = new Container();

    const layers: Layers = {
      floor: new Container(),
      entities: new Container(),
      overlay: new Container(),
    };
    // 2.5D: las entidades se ordenan por profundidad (zIndex = y de sus pies),
    // así el avatar pasa por delante o por detrás de props y muros según dónde esté.
    layers.entities.sortableChildren = true;

    world.addChild(layers.floor, layers.entities, layers.overlay);
    app.stage.addChild(world, screen);

    return new Renderer(app, world, screen, layers);
  }

  /** Tamaño actual del viewport en píxeles CSS. */
  get viewport(): { w: number; h: number } {
    return { w: this.app.screen.width, h: this.app.screen.height };
  }

  destroy(): void {
    this.app.destroy(true, { children: true });
  }
}
