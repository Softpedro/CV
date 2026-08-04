// content/spaceRegistry.ts — LOS ESPACIOS del mundo, como configuración.
// Agregar un espacio = push de un SpaceDefinition acá. El engine no se toca.
//
// Nota: rects/posiciones están en coordenadas de mundo (px). Cuando el registry
// pase a manejar el mundo (paso 7: Proximity + Onboarding leen esto), el tilemap
// se autora para calzar con estos rects. Hoy son la fuente de verdad del diseño.

import type { SpaceDefinition, DropDefinition } from './types';
import type { VisitorClass } from '../data/types';
import type { Vec2 } from '../engine';

export const spaces: SpaceDefinition[] = [
  {
    id: 'codigo',
    label: 'DROPE CÓDIGO',
    accent: 'aqua', // Código = Aqua (data en vivo)
    rect: { x: 180, y: 140, w: 220, h: 150 },
    anchor: 'anchor.monitor',
    dataKey: 'github',
    panel: 'code',
    spawnFor: ['recruiter'],
    drops: [{ id: 'drop.codigo', pos: { x: 290, y: 250 } }],
    welcome: {
      recruiter: 'Justo lo que viniste a ver.',
      curious: 'El lado que construye.',
      client: 'Así es como se hacen las cosas acá.',
    },
  },
  {
    id: 'juegos',
    label: 'DROPE JUEGOS',
    accent: 'lime', // Juegos = Lime
    rect: { x: 880, y: 140, w: 220, h: 150 },
    anchor: 'anchor.arcade',
    dataKey: 'dota', // fuente marquesina; el panel también lee 'clash' y 'brawl'
    panel: 'games',
    spawnFor: ['droper'],
    drops: [{ id: 'drop.juegos', pos: { x: 990, y: 250 } }],
    welcome: {
      droper: 'Sabías que este pasillo existía.',
      curious: 'Todo lo que se juega deja rastro.',
      recruiter: 'Los reflejos también cuentan.',
    },
  },
  {
    id: 'lectura',
    label: 'DROPE LECTURA',
    accent: 'paper', // Lectura = Paper
    rect: { x: 180, y: 606, w: 220, h: 150 },
    anchor: 'anchor.atril',
    dataKey: 'book',
    panel: 'reading',
    spawnFor: ['curious'],
    drops: [{ id: 'drop.lectura', pos: { x: 290, y: 716 } }],
    welcome: {
      curious: 'Lo que estoy leyendo, sin filtro.',
      client: 'Las ideas antes del producto.',
      droper: 'La página exacta donde voy.',
    },
  },
  {
    id: 'plaza',
    label: 'PLAZA DROPE',
    accent: 'violet', // Plaza = Violet (punto de entrada)
    rect: { x: 540, y: 373, w: 200, h: 150 },
    anchor: 'anchor.plaza',
    panel: 'plaza',
    spawnFor: ['client'],
    drops: [
      { id: 'drop.plaza', pos: { x: 640, y: 490 } },
      { id: 'drop.oculta', pos: { x: 1180, y: 820 }, hidden: true }, // la difícil (1 en todo el mundo)
    ],
    welcome: {
      recruiter: 'Empecemos. El CV está a un clic.',
      client: 'Bienvenido. ¿Qué venís a construir?',
      curious: 'Andá a donde te lleve la curiosidad.',
      droper: 'Ya sabés cómo se camina esto.',
    },
  },
];

/** Todos los drops del mundo, aplanados (con el espacio al que pertenecen).
 * Fuente única para el DropSystem (engine) y el contador del HUD (ui). */
export const drops: (DropDefinition & { spaceId: string })[] = spaces.flatMap((s) =>
  (s.drops ?? []).map((d) => ({ ...d, spaceId: s.id })),
);

/** Drops visibles = los que se pueden ver y contar (la oculta no cuenta al total). */
export const visibleDropCount = drops.filter((d) => !d.hidden).length;

/** Centro del rect de un espacio (punto de spawn/ancla en px de mundo). */
export function spaceCenter(s: SpaceDefinition): Vec2 {
  return { x: s.rect.x + s.rect.w / 2, y: s.rect.y + s.rect.h / 2 };
}

/** El espacio donde aparece una clase, según spawnFor. Plaza como fallback. */
export function spaceForClass(c: VisitorClass): SpaceDefinition {
  return spaces.find((s) => s.spawnFor?.includes(c)) ?? spaces.find((s) => s.id === 'plaza') ?? spaces[0];
}
