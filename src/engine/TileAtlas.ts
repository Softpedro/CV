// engine/TileAtlas.ts — carga un tilesheet (PNG) y lo corta en texturas por índice.
// Genérico: no conoce DROPE. Los tiles se referencian por índice en un grid de
// `cols` columnas (row-major), igual que los índices de un mapa de Tiled.
// Es la infra de arte: TileMap/drops/anclas piden texturas acá en vez de dibujar
// rects. Carga tolerante: si el PNG falta, `ready` queda en false y quien lo use
// puede caer al placeholder sin romper.

import { Assets, Texture, Rectangle } from 'pixi.js';

export interface AtlasConfig {
  url: string;
  tile: number; // px por tile en el sheet (p. ej. 16)
  cols: number; // columnas del grid
}

export class TileAtlas {
  readonly tile: number;
  readonly cols: number;
  private readonly url: string;
  private source: Texture | null = null;
  private readonly cache = new Map<number, Texture>();
  private _ready = false;

  constructor(cfg: AtlasConfig) {
    this.url = cfg.url;
    this.tile = cfg.tile;
    this.cols = cfg.cols;
  }

  /** true si el sheet cargó y se puede pedir texturas. */
  get ready(): boolean {
    return this._ready;
  }

  /** Carga el sheet. No lanza: ante error deja ready=false (fallback a placeholder). */
  async load(): Promise<void> {
    try {
      const tex = (await Assets.load(this.url)) as Texture;
      tex.source.scaleMode = 'nearest'; // pixel-art: sin blur al escalar
      this.source = tex;
      this._ready = true;
    } catch {
      this._ready = false;
    }
  }

  /** Textura de un tile por índice (row-major en el grid de `cols`). Cacheada. */
  at(index: number): Texture {
    if (!this.source) throw new Error('TileAtlas: sheet no cargado (revisar ready)');
    const cached = this.cache.get(index);
    if (cached) return cached;
    const col = index % this.cols;
    const row = Math.floor(index / this.cols);
    const t = new Texture({
      source: this.source.source,
      frame: new Rectangle(col * this.tile, row * this.tile, this.tile, this.tile),
    });
    this.cache.set(index, t);
    return t;
  }
}
