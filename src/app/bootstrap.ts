// app/bootstrap.ts — arranca el engine y monta el mundo caminable.
// Paso 7: la fuente de verdad de las zonas es content/spaceRegistry (no el mapa).
// El onboarding elige clase → el avatar spawnea en la zona según spawnFor.
// Proximity escribe la zona cercana al gameStore; React abre el panel.
// El movimiento SIEMPRE pasa por MovementTransport y se congela con overlays.

import { Container, Graphics, Sprite, Texture } from 'pixi.js';
import {
  Camera, Input, Renderer, TickLoop, TileMap, Proximity, DropSystem, TileAtlas,
  RectsCollider, CompositeCollider, PALETTE,
} from '../engine';
import type { Vec2, WorldRect } from '../engine';
import { Player, AvatarController, LocalTransport } from '../world';
import type { Facing } from '../world';
import { spaces, spaceForClass, spaceCenter, drops } from '../content';
import type { SpaceDefinition } from '../content';
import { useGameStore } from '../data';

// BASE_URL (siempre termina en '/') para que los assets carguen bajo subpath.
const BASE = import.meta.env.BASE_URL;
const MAP_URL = `${BASE}maps/testroom.json`;
const PROXIMITY_RADIUS = 110; // px: "cerca para entrar" (no todo el mundo)
// Tilesheet Kenney "Tiny Town" (CC0): 16px/tile, grid de 12 columnas.
const ATLAS: import('../engine').AtlasConfig = { url: `${BASE}art/tiny-town.png`, tile: 16, cols: 12 };
// Personajes: Kenney "Tiny Dungeon" (CC0), misma serie y mismo grid que Tiny Town.
const CHARS: import('../engine').AtlasConfig = { url: `${BASE}art/tiny-dungeon.png`, tile: 16, cols: 12 };
const AVATAR_TILE = 99; // figura de túnica violeta: es la que pega con la marca
const WALK_BOB_AMP = 2; // px de rebote al caminar
const WALK_BOB_SPEED = 11; // rad/s del rebote
const MARKER_Y = -36; // altura del punto lime sobre la cabeza (sprite: 32px, pies en AVATAR_FOOT)
const HERO_HALF = 15; // px: medio lado del bloque-ancla (fallback sin atlas)
const HERO_LIFT = 8; // px que el ancla se corre hacia arriba del centro del espacio,
// para dejar libre el punto de spawn y el drop, que caen debajo.
const SHADOW_ALPHA = 0.26; // opacidad de las sombras de contacto
const BOB_LIFT = 7; // px que flota un drop sobre el piso
const BOB_AMP = 2.5; // px de amplitud del flote
const BOB_SPEED = 2.6; // rad/s del flote
// Un edificio que te tapa por completo desorienta: se vuelve translúcido.
const FADE_ALPHA = 0.5; // opacidad del ancla cuando esconde al avatar
const FADE_SPEED = 9; // 1/s de acercamiento (evita el parpadeo al entrar/salir)
const AVATAR_HALF_W = 9; // media caja del avatar, para el test de tapado
const AVATAR_HEAD = 22;
const AVATAR_FOOT = 4;
const GLOW_SIZE = 30; // px del halo de un drop
// Cuánto se sube el borde inferior del sólido de un ancla respecto de lo dibujado.
// DEBE ser menor que HERO_LIFT (ver solidsOf).
const SOLID_INSET = 6;

export interface EngineHandle {
  destroy(): void;
  setTouch(dir: Vec2 | null): void;
  debug(): {
    pos: Vec2;
    facing: Facing;
    nearestZone: string | null;
    collected: number;
    atlasReady: boolean;
    charsReady: boolean;
  };
}

export async function bootstrap(mount: HTMLElement): Promise<EngineHandle> {
  const renderer = await Renderer.create(mount);
  const input = new Input(renderer.app.canvas as unknown as HTMLElement);
  const loop = new TickLoop(renderer.app);

  // --- Arte: cargar los tilesheets antes de construir el mundo (tolerante a fallo) ---
  const atlas = new TileAtlas(ATLAS);
  const chars = new TileAtlas(CHARS);
  await Promise.all([atlas.load(), chars.load()]);

  // --- Mapa: límites y colisión (las zonas ya no salen del mapa) ---
  const map = await TileMap.load(MAP_URL);
  map.render(renderer.layers.floor, renderer.layers.entities, atlas);
  const occluders = drawSpaces(renderer.layers.floor, renderer.layers.entities, atlas, map.tile);
  const dropNodes = drawDrops(renderer.layers.entities);

  // --- Entidad + costura de movimiento (con colisión vía Collider) ---
  const spawn = spaceCenter(spaces.find((s) => s.id === 'plaza') ?? spaces[0]);
  const player = new Player(spawn);
  // Los edificios también frenan: el TileMap resuelve la grilla de muros y el
  // RectsCollider los sólidos que no viven en la grilla (las anclas).
  const collider = new CompositeCollider(map, new RectsCollider(solidsOf(occluders)));
  const transport = new LocalTransport(player, map.bounds, collider);
  const controller = new AvatarController(input, transport);
  const unsubPeers = transport.subscribeRemote(() => {
    /* Fase 3: renderizar otros avatares */
  });

  // --- Proximidad desde el spaceRegistry (content = fuente de verdad) ---
  const zones = spaces.map((s) => ({ id: s.id, rect: s.rect }));
  const proximity = new Proximity(zones, PROXIMITY_RADIUS);
  let nearestZone: string | null = null;
  const unsubZone = proximity.subscribe((id) => {
    nearestZone = id;
    useGameStore.getState().setNearZone(id); // el engine escribe; React lee
  });

  // --- La caza: recoger drops al pisarlos (content = fuente de verdad) ---
  const dropSystem = new DropSystem(drops.map((d) => ({ id: d.id, pos: d.pos })));
  const unsubDrops = dropSystem.subscribe((id) => {
    useGameStore.getState().collectDrop(id); // el engine detecta; React cuenta
    const view = dropNodes.get(id);
    if (view) {
      view.node.destroy({ children: true }); // ocultar el recogido (las ocultas no tienen nodo)
      dropNodes.delete(id); // y sale del bucle de flote
    }
  });

  // --- Atmósfera: viñeta fija a pantalla (encima del mundo, debajo del HUD) ---
  const vignette = makeVignette();
  renderer.screen.addChild(vignette);

  // --- Cámara que sigue al jugador ---
  const camera = new Camera(renderer.world, map.bounds);
  camera.lerp = 0.18;
  camera.snapTo(spawn);

  // --- Avatar ---
  const avatar = makeAvatar(chars, map.tile);
  renderer.layers.entities.addChild(avatar.node);

  // Elegir clase → spawnear en la zona correcta (según spawnFor).
  const unsubGame = useGameStore.subscribe((state, prev) => {
    if (state.visitorClass && state.visitorClass !== prev.visitorClass) {
      const target = spaceCenter(spaceForClass(state.visitorClass));
      player.pos = { ...target };
      camera.snapTo(target);
    }
  });

  let elapsed = 0; // segundos acumulados, para las animaciones de ambiente
  const stopUpdate = loop.onUpdate((dt) => {
    elapsed += dt;
    const g = useGameStore.getState();
    // Congelar movimiento durante onboarding, panel abierto o vista CV.
    const canMove = g.visitorClass !== null && g.openPanel === null && !g.cvOpen;
    if (canMove) controller.update(dt);
    else input.setTouch(null);

    proximity.update(player.pos); // detecta zona; emite si cambió
    if (canMove) dropSystem.update(player.pos); // recoge drops al caminar sobre ellos
    for (const view of dropNodes.values()) view.bob(elapsed); // flote (2.5D)
    updateOccluders(occluders, player, dt); // transparentar lo que tape al avatar
    avatar.sync(player, elapsed);
    camera.target = player.pos;
    camera.update(renderer.viewport);

    // La viñeta cubre el viewport; se reajusta solo cuando cambia de tamaño.
    const vp = renderer.viewport;
    if (vignette.width !== vp.w || vignette.height !== vp.h) vignette.setSize(vp.w, vp.h);
  });

  loop.start();

  return {
    setTouch: (d) => input.setTouch(d),
    debug: () => ({
      pos: { ...player.pos },
      facing: player.facing,
      nearestZone,
      collected: useGameStore.getState().collectedDrops.size,
      atlasReady: atlas.ready,
      charsReady: chars.ready,
    }),
    destroy: () => {
      stopUpdate();
      unsubPeers();
      unsubZone();
      unsubDrops();
      unsubGame();
      loop.stop();
      input.destroy();
      renderer.destroy();
    },
  };
}

// --- Placeholders visuales (se van cuando entra el arte real) ---

/** Descompone un color 0xRRGGBB en sus canales. */
function rgb(color: number): [number, number, number] {
  return [(color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff];
}

/** Textura de degradado radial (centro → borde). Los degradados salen más
 * fiables en canvas 2D que en Graphics, y una textura chica estirada alcanza:
 * un degradado no necesita resolución. */
function radialTexture(color: number, innerAlpha: number, outerAlpha: number, stop: number): Texture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const [r, g, b] = rgb(color);
    const grad = ctx.createRadialGradient(size / 2, size / 2, size * stop, size / 2, size / 2, size * 0.62);
    grad.addColorStop(0, `rgba(${r},${g},${b},${innerAlpha})`);
    grad.addColorStop(1, `rgba(${r},${g},${b},${outerAlpha})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }
  return Texture.from(canvas);
}

/** Viñeta: oscurece los bordes de la pantalla y empuja la mirada al centro.
 * Va en la capa fija (`screen`), no en el mundo: no se mueve con la cámara. */
function makeVignette(): Sprite {
  // Suave a propósito: es un CV, el contenido tiene que seguir legible en los bordes.
  const sp = new Sprite(radialTexture(PALETTE.ink, 0, 0.52, 0.36));
  sp.eventMode = 'none';
  return sp;
}

/** Sombra de contacto: elipse tenue que "apoya" una entidad en el piso.
 * Se dibuja centrada en (0,0) y se ubica con `y` para que escalarla no la mueva. */
function makeShadow(rx: number, ry: number, y: number): Graphics {
  const g = new Graphics();
  g.ellipse(0, 0, rx, ry).fill({ color: PALETTE.ink, alpha: SHADOW_ALPHA });
  g.y = y;
  return g;
}

/** Receta de un edificio: filas de índices del atlas (row-major). -1 = celda vacía.
 * `roofRows` son las filas de arriba que se tintan con el accent del espacio. */
interface BuildingRecipe {
  tiles: readonly (readonly number[])[];
  roofRows: number;
}

// Dos casas del pack que combinan techo y pared del mismo juego de colores.
const HOUSE_GRAY: BuildingRecipe = {
  tiles: [
    [48, 49, 50], // techo (fila alta)
    [60, 61, 62], // techo (alero)
    [88, 90, 88], // fachada: ventana · puerta · ventana
  ],
  roofRows: 2,
};
const HOUSE_TAN: BuildingRecipe = {
  tiles: [
    [52, 53, 54],
    [64, 65, 66],
    [84, 86, 84],
  ],
  roofRows: 2,
};

/** El ancla de cada espacio (content) decide qué edificio se construye. */
const BUILDINGS: Record<string, BuildingRecipe> = {
  'anchor.monitor': HOUSE_GRAY,
  'anchor.arcade': HOUSE_TAN,
  'anchor.atril': HOUSE_GRAY,
  'anchor.plaza': HOUSE_TAN,
};

/** Aclara un color hacia blanco (k=0 lo deja igual, k=1 lo vuelve blanco).
 * El tint de Pixi multiplica: tintar con el color ya lavado empuja el techo
 * hacia el accent del espacio sin ensuciarlo. */
function wash(color: number, k: number): number {
  const mix = (c: number) => Math.round(c + (255 - c) * k);
  return (mix((color >> 16) & 0xff) << 16) | (mix((color >> 8) & 0xff) << 8) | mix(color & 0xff);
}

/** Un ancla dibujada: su nodo y el tamaño de la caja que ocupa sobre la base. */
interface Prop {
  node: Container;
  w: number;
  h: number;
}

/** Ancla que puede tapar al avatar: se vuelve translúcida cuando lo esconde. */
interface Occluder {
  node: Container;
  rect: WorldRect; // área dibujada, en px de mundo
  base: number; // y de la base = su profundidad
}

/** Edificio-ancla de un espacio. El origen del nodo es el CENTRO DE SU BASE,
 * así ubicarlo y ordenarlo por profundidad usa la misma coordenada. */
function makeBuilding(s: SpaceDefinition, atlas: TileAtlas, tile: number): Prop {
  const recipe = BUILDINGS[s.anchor] ?? HOUSE_GRAY;
  const scale = tile / atlas.tile;
  const rows = recipe.tiles.length;
  const cols = recipe.tiles[0].length;
  const w = cols * tile;
  const h = rows * tile;

  const node = new Container();
  node.addChild(makeShadow(w * 0.46, 7, -3)); // sombra pegada a la base

  const roofTint = wash(PALETTE[s.accent], 0.45);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = recipe.tiles[r][c];
      if (idx < 0) continue;
      const sp = new Sprite(atlas.at(idx));
      sp.scale.set(scale);
      sp.position.set(-w / 2 + c * tile, -h + r * tile);
      if (r < recipe.roofRows) sp.tint = roofTint; // identidad de color por espacio
      node.addChild(sp);
    }
  }
  return { node, w, h };
}

/** Bloque-ancla plano: fallback cuando el tilesheet no cargó. */
function makeAnchorBlock(color: number): Prop {
  const side = HERO_HALF * 2;
  const block = new Graphics();
  block.rect(-HERO_HALF, -side, side, side).fill({ color }).stroke({ width: 2, color: PALETTE.ink });
  const node = new Container();
  node.addChild(makeShadow(HERO_HALF + 1, 5, 0), block); // origen del nodo = base
  return { node, w: side, h: side };
}

/** Dibuja cada espacio: contorno de la zona en el piso + su edificio-ancla.
 * El ancla es un nodo propio en `entities` para que el Y-sort la ordene contra
 * el avatar (2.5D: se le pasa por delante o se esconde por detrás). */
function drawSpaces(floor: Container, entities: Container, atlas: TileAtlas, tile: number): Occluder[] {
  const zonesG = new Graphics();
  const occluders: Occluder[] = [];
  for (const s of spaces) {
    // Área de la zona (contorno tenue en su color).
    zonesG
      .roundRect(s.rect.x, s.rect.y, s.rect.w, s.rect.h, 6)
      .stroke({ width: 2, color: PALETTE[s.accent], alpha: 0.45 });

    const c = spaceCenter(s);
    const base = c.y - HERO_LIFT;
    const { node, w, h } = atlas.ready ? makeBuilding(s, atlas, tile) : makeAnchorBlock(PALETTE[s.accent]);
    node.position.set(c.x, base);
    node.zIndex = base; // profundidad por la base del edificio
    entities.addChild(node);
    occluders.push({ node, base, rect: { x: c.x - w / 2, y: base - h, w, h } });
  }
  floor.addChild(zonesG);
  return occluders;
}

/** Footprint sólido de cada ancla: su caja dibujada, con el borde inferior subido
 * `SOLID_INSET` px. Ese margen hace dos cosas, y por eso SOLID_INSET < HERO_LIFT:
 *  1. deja el spawn (que cae en el centro del espacio, HERO_LIFT px por debajo de
 *     la base) fuera del sólido, con aire de sobra en vez de rozándolo;
 *  2. impide que el avatar suba tanto como para quedar dibujado DETRÁS del mismo
 *     edificio contra el que está chocando, que se vería como un bug. */
function solidsOf(occluders: Occluder[]): WorldRect[] {
  return occluders.map((o) => ({ ...o.rect, h: o.rect.h - SOLID_INSET }));
}

/** Atenúa las anclas que están tapando al avatar (y devuelve las demás a opaco).
 * Sin esto, caminar por detrás de un edificio te hace desaparecer del todo. */
function updateOccluders(occluders: Occluder[], p: Player, dt: number): void {
  const { x, y } = p.pos;
  const k = Math.min(1, dt * FADE_SPEED);
  for (const o of occluders) {
    const hides =
      y < o.base && // el avatar está detrás (más al norte que la base)
      x + AVATAR_HALF_W > o.rect.x &&
      x - AVATAR_HALF_W < o.rect.x + o.rect.w &&
      y + AVATAR_FOOT > o.rect.y &&
      y - AVATAR_HEAD < o.rect.y + o.rect.h;
    o.node.alpha += ((hides ? FADE_ALPHA : 1) - o.node.alpha) * k;
  }
}

/** Un drop dibujado: el nodo (para retirarlo al recoger) y su animación de flote. */
interface DropView {
  node: Container;
  /** Anima el flote en el tiempo `t` (segundos). La sombra queda en el piso. */
  bob(t: number): void;
}

/** Dibuja los drops visibles como nodos individuales (para poder ocultar el
 * recogido). Las ocultas no se dibujan pero siguen siendo recogibles.
 * Devuelve id → vista, para que el DropSystem retire el sprite al recoger. */
function drawDrops(entities: Container): Map<string, DropView> {
  const views = new Map<string, DropView>();
  const glowTex = radialTexture(PALETTE.lime, 0.55, 0, 0); // una sola textura para todos
  for (const d of drops) {
    if (d.hidden) continue;

    const shadow = makeShadow(6, 3, 0);
    const glow = new Sprite(glowTex);
    glow.anchor.set(0.5);
    glow.setSize(GLOW_SIZE);
    const body = new Graphics();
    body.circle(0, 0, 6).fill(PALETTE.lime).stroke({ width: 1.5, color: PALETTE.ink });

    const node = new Container();
    node.addChild(shadow, glow, body);
    node.position.set(d.pos.x, d.pos.y); // el nodo se ancla al piso
    node.zIndex = d.pos.y;
    entities.addChild(node);

    // Desfase estable por posición: los drops no laten todos al unísono.
    const phase = (d.pos.x + d.pos.y) * 0.03;
    views.set(d.id, {
      node,
      bob: (t) => {
        const s = Math.sin(t * BOB_SPEED + phase);
        body.y = -BOB_LIFT + s * BOB_AMP;
        glow.y = body.y; // el halo acompaña al drop en el aire
        glow.alpha = 0.78 + 0.22 * s; // latido suave
        // Más alto → sombra más chica y tenue: refuerza la altura.
        const k = 1 - 0.12 * (s + 1);
        shadow.scale.set(k);
        shadow.alpha = k;
      },
    });
  }
  return views;
}

/** Cuerpo del avatar y cómo se orienta. Dos implementaciones intercambiables:
 * el personaje real y el muñeco geométrico de respaldo. En ambas el origen
 * local son los pies. */
interface AvatarBody {
  node: Container;
  face(f: Facing): void;
}

/** Personaje de Tiny Dungeon. Kenney no publica vistas de espalda ni de perfil
 * (lo verificamos sobre los sprites), así que el facing se resuelve espejando:
 * izquierda invierte el sprite, derecha lo deja. Arriba y abajo CONSERVAN la
 * orientación anterior — mejor eso que un giro fantasma al caminar en vertical. */
function spriteBody(chars: TileAtlas, tile: number): AvatarBody {
  const scale = tile / chars.tile;
  const sprite = new Sprite(chars.at(AVATAR_TILE));
  sprite.anchor.set(0.5, 1); // ancla en los pies
  sprite.scale.set(scale);
  return {
    node: sprite, // Sprite ya es un Container
    face: (f) => {
      if (f === 'left') sprite.scale.x = -scale;
      else if (f === 'right') sprite.scale.x = scale;
    },
  };
}

/** Muñeco geométrico: respaldo si el sheet de personajes no cargó. */
function blockBody(): AvatarBody {
  const node = new Container();
  const body = new Graphics();
  body.roundRect(-9, -26, 18, 26, 3).fill(PALETTE.violet).stroke({ width: 2, color: PALETTE.ink });
  const emblem = new Graphics();
  emblem.circle(0, -16, 3).fill(PALETTE.lime);
  const nose = new Graphics();
  nose.rect(-3, -3, 6, 6).fill(PALETTE.paper);
  node.addChild(body, emblem, nose);

  const NOSE: Record<Facing, readonly [number, number]> = {
    up: [0, -24],
    down: [0, -4],
    left: [-8, -13],
    right: [8, -13],
  };
  return {
    node,
    face: (f) => {
      const [nx, ny] = NOSE[f];
      nose.position.set(nx, ny);
    },
  };
}

/** Avatar del visitante. El origen del nodo son los pies: así la sombra, el
 * Y-sort y la caja de colisión hablan todos de la misma coordenada. */
function makeAvatar(chars: TileAtlas, tile: number): { node: Container; sync: (p: Player, t: number) => void } {
  const node = new Container();
  const body = chars.ready ? spriteBody(chars, tile) : blockBody();

  // Marcador "este sos vos": punto lime sobre la cabeza. Hace doble trabajo —
  // sostiene la marca DROPE sobre un sprite ajeno y te ubica de un vistazo.
  const marker = new Graphics();
  marker.circle(0, 0, 2.5).fill(PALETTE.lime).stroke({ width: 1, color: PALETTE.ink });

  node.addChild(makeShadow(9, 4, AVATAR_FOOT), body.node, marker);

  return {
    node,
    sync: (p, t) => {
      node.position.set(Math.round(p.pos.x), Math.round(p.pos.y));
      node.zIndex = p.pos.y; // 2.5D: se ordena contra props y muros por profundidad
      // Rebote al caminar: el cuerpo sube y baja, la sombra se queda en el piso.
      const bob = p.moving ? -Math.abs(Math.sin(t * WALK_BOB_SPEED)) * WALK_BOB_AMP : 0;
      body.node.y = AVATAR_FOOT + bob;
      marker.y = MARKER_Y + bob;
      body.face(p.facing);
    },
  };
}
