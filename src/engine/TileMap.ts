// engine/TileMap.ts — carga un mapa exportado de Tiled/LDtk (JSON) y expone:
// - los límites del mundo (px),
// - colisión (implementa Collider) a partir de la capa de muros,
// - las zonas nombradas (capa de objetos) para Proximity,
// - un render placeholder (colores planos hasta que entre el tileset real).
// Genérico: no conoce DROPE, solo capas de piso, muros y objetos.

import { Container, Graphics, Sprite } from 'pixi.js';
import type { Collider, Zone, WorldRect } from './types';
import type { TileAtlas } from './TileAtlas';
import { PALETTE } from './types';

// Índices en el tilesheet Kenney "Tiny Town" (grid 12 cols):
const GRASS = 0; // grass liso
const GRASS_ALT = 1; // variación sutil (casi igual)
const GRASS_FLOWER = 2; // grass con flores (detalle, escaso)
// Muro de piedra como nine-slice (bordes propios en vez de un bloque repetido):
//    96  97  98   ← coronación con almenas (se dibuja ELEVADA: es la altura)
//   108 109 110   ← relleno del cuerpo
//   120 121 122   ← base (borde inferior)
const WALL_NINE = [
  [96, 97, 98],
  [108, 109, 110],
  [120, 121, 122],
] as const;
const WALL_ROW_CAP = 0;
const WALL_ROW_FILL = 1;
const WALL_ROW_BASE = 2;

/** Índice de piso para una celda: mayormente liso, con detalle escaso y determinista.
 * Las flores van MUY espaciadas a propósito: un piso ruidoso compite con las
 * sombras y la altura de los muros, y aplana la escena. */
function floorTileFor(tx: number, ty: number): number {
  const h = ((tx * 73856093) ^ (ty * 19349663)) >>> 0;
  if (h % 53 === 0) return GRASS_FLOWER; // flor ~1/53 celdas (acento, no textura)
  if (h % 7 === 0) return GRASS_ALT; // variación sutil ~1/7 celdas
  return GRASS;
}

// Subconjunto mínimo del formato Tiled JSON que consumimos.
interface TiledLayer {
  name: string;
  type: 'tilelayer' | 'objectgroup' | string;
  data?: number[]; // row-major; 0 = vacío, !=0 = tile presente
  width?: number;
  height?: number;
  objects?: Array<{ name: string; x: number; y: number; width: number; height: number }>;
}
interface TiledMap {
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  layers: TiledLayer[];
}

export class TileMap implements Collider {
  readonly cols: number;
  readonly rows: number;
  readonly tile: number;
  readonly bounds: WorldRect;
  readonly zones: Zone[];
  private readonly solid: Uint8Array; // 1 = sólido

  private constructor(map: TiledMap) {
    this.cols = map.width;
    this.rows = map.height;
    this.tile = map.tilewidth;
    this.bounds = { x: 0, y: 0, w: map.width * map.tilewidth, h: map.height * map.tileheight };

    // Colisión: cualquier tile !=0 en la capa de muros/colisión es sólido.
    this.solid = new Uint8Array(map.width * map.height);
    const walls = map.layers.find((l) => l.type === 'tilelayer' && /wall|colli|muro/i.test(l.name));
    if (walls?.data) {
      for (let i = 0; i < walls.data.length; i++) if (walls.data[i] !== 0) this.solid[i] = 1;
    }

    // Zonas: cada objeto de las capas de objetos es una Zone (px de mundo).
    this.zones = [];
    for (const l of map.layers) {
      if (l.type === 'objectgroup' && l.objects) {
        for (const o of l.objects) {
          this.zones.push({ id: o.name, rect: { x: o.x, y: o.y, w: o.width, h: o.height } });
        }
      }
    }
  }

  static async load(url: string): Promise<TileMap> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`TileMap: no se pudo cargar ${url} (${res.status})`);
    return new TileMap((await res.json()) as TiledMap);
  }

  /** Collider: ¿el rect toca algún tile sólido? Fuera del mapa = sólido. */
  hits(rect: WorldRect): boolean {
    const t = this.tile;
    const x0 = Math.floor(rect.x / t);
    const y0 = Math.floor(rect.y / t);
    const x1 = Math.floor((rect.x + rect.w - 1e-3) / t);
    const y1 = Math.floor((rect.y + rect.h - 1e-3) / t);
    for (let ty = y0; ty <= y1; ty++) {
      for (let tx = x0; tx <= x1; tx++) {
        if (tx < 0 || ty < 0 || tx >= this.cols || ty >= this.rows) return true;
        if (this.solid[ty * this.cols + tx]) return true;
      }
    }
    return false;
  }

  /** ¿La celda es sólida? Fuera del mapa cuenta como vacío, para que el borde
   * del mundo dibuje su arista en vez de quedar cortado. Solo para render:
   * la colisión (`hits`) trata el fuera-de-mapa como sólido, y eso no cambia. */
  private solidAt(tx: number, ty: number): boolean {
    if (tx < 0 || ty < 0 || tx >= this.cols || ty >= this.rows) return false;
    return this.solid[ty * this.cols + tx] === 1;
  }

  /** Tile del nine-slice para una celda de muro, según sus vecinos E/O. */
  private wallTile(tx: number, ty: number, row: number): number {
    const col = !this.solidAt(tx - 1, ty) ? 0 : !this.solidAt(tx + 1, ty) ? 2 : 1;
    return WALL_NINE[row][col];
  }

  /** Dibuja el mapa. Con atlas listo usa tiles reales; si no, cae al placeholder.
   * El piso va a `floorTarget`; los muros a `wallTarget`, que debe tener
   * `sortableChildren` para que el avatar se ordene con ellos por profundidad. */
  render(floorTarget: Container, wallTarget: Container, atlas?: TileAtlas): void {
    if (atlas?.ready) this.renderTiles(floorTarget, wallTarget, atlas);
    else this.renderPlaceholder(floorTarget);
  }

  /** Render con tiles reales: piso por celda + muros nine-slice con altura.
   * Los muros se elevan media celda hacia arriba (coronación) y se ordenan por
   * su base, así el avatar que camina por detrás queda tapado: eso es el 2.5D.
   * La colisión no cambia — sigue siendo el footprint de la celda. */
  private renderTiles(floorTarget: Container, wallTarget: Container, atlas: TileAtlas): void {
    const t = this.tile;
    const scale = t / atlas.tile; // 32/16 = ×2, nearest (sin blur)
    const rise = t / 2; // px que el muro sobresale por encima de su celda

    const floor = new Container();
    for (let ty = 0; ty < this.rows; ty++) {
      for (let tx = 0; tx < this.cols; tx++) {
        // Piso bajo todas las celdas (variante determinista, sin RNG).
        floor.addChild(placeTile(atlas.at(floorTileFor(tx, ty)), tx * t, ty * t, scale));
      }
    }
    floorTarget.addChild(floor);

    for (let ty = 0; ty < this.rows; ty++) {
      for (let tx = 0; tx < this.cols; tx++) {
        if (!this.solidAt(tx, ty)) continue;
        // Profundidad = base de la celda: quien esté más abajo se dibuja delante.
        const depth = (ty + 1) * t;
        // Cuerpo: base si tiene piso debajo, relleno si sigue el muro.
        const row = this.solidAt(tx, ty + 1) ? WALL_ROW_FILL : WALL_ROW_BASE;
        const body = placeTile(atlas.at(this.wallTile(tx, ty, row)), tx * t, ty * t, scale);
        body.zIndex = depth;
        wallTarget.addChild(body);
        // Coronación: solo en el borde superior del muro, elevada → da la altura.
        if (!this.solidAt(tx, ty - 1)) {
          const cap = placeTile(atlas.at(this.wallTile(tx, ty, WALL_ROW_CAP)), tx * t, ty * t - rise, scale);
          cap.zIndex = depth;
          wallTarget.addChild(cap);
        }
      }
    }
  }

  /** Placeholder: piso ink + grilla tenue, muros en bloque paper. Fallback si falta el atlas. */
  private renderPlaceholder(target: Container): void {
    const t = this.tile;

    const floor = new Graphics();
    floor.rect(0, 0, this.bounds.w, this.bounds.h).fill(PALETTE.ink);
    for (let c = 0; c <= this.cols; c++) floor.moveTo(c * t, 0).lineTo(c * t, this.bounds.h);
    for (let r = 0; r <= this.rows; r++) floor.moveTo(0, r * t).lineTo(this.bounds.w, r * t);
    floor.stroke({ width: 1, color: PALETTE.paper, alpha: 0.05 });

    const walls = new Graphics();
    for (let ty = 0; ty < this.rows; ty++) {
      for (let tx = 0; tx < this.cols; tx++) {
        if (this.solid[ty * this.cols + tx]) walls.rect(tx * t, ty * t, t, t);
      }
    }
    walls.fill({ color: PALETTE.paper, alpha: 0.85 });

    target.addChild(floor, walls);
  }
}

/** Sprite de un tile ubicado en (x,y) de mundo y escalado al tamaño de celda. */
function placeTile(texture: import('pixi.js').Texture, x: number, y: number, scale: number): Sprite {
  const s = new Sprite(texture);
  s.position.set(x, y);
  s.scale.set(scale);
  return s;
}
