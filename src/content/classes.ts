// content/classes.ts — LAS 4 CLASES de visitante + su spawn.
// El onboarding (paso 7) muestra estas opciones; elegir una cambia dónde
// aparece el jugador y el marco de bienvenida por espacio (ver welcome en
// spaceRegistry). Los spawns están en coordenadas de mundo (px).

import type { ClassDefinition } from './types';
import type { VisitorClass } from '../data/types';

export const classes: ClassDefinition[] = [
  {
    id: 'recruiter',
    label: 'Reclutador',
    tagline: 'Vengo a evaluar.',
    spawn: { x: 290, y: 320 }, // aterriza mirando DROPE CÓDIGO
  },
  {
    id: 'client',
    label: 'Cliente',
    tagline: 'Vengo a construir algo.',
    spawn: { x: 640, y: 460 }, // Plaza
  },
  {
    id: 'curious',
    label: 'Curioso',
    tagline: 'Vengo a mirar.',
    spawn: { x: 640, y: 448 }, // centro de la Plaza
  },
  {
    id: 'droper',
    label: 'Droper',
    tagline: 'Ya soy de la casa.',
    spawn: { x: 990, y: 320 }, // aterriza mirando DROPE JUEGOS
  },
];

/** Acceso por id (lo usa el onboarding para resolver la clase elegida). */
export const classById: Record<VisitorClass, ClassDefinition> = Object.fromEntries(
  classes.map((c) => [c.id, c]),
) as Record<VisitorClass, ClassDefinition>;
