// content/types.ts — contratos de la config data-driven.
// Un espacio y una clase son PURA CONFIG: el engine jamás los hardcodea.
// Depende hacia abajo: tipos de engine/ (geometría, paleta) y de data/ (clases).

import type { WorldRect, SpriteRef, PaletteColor, Vec2 } from '../engine';
import type { VisitorClass } from '../data/types';

/** Clave en panelRegistry (paso 7): qué componente React renderiza el espacio. */
export type PanelId = string;

export interface DropDefinition {
  id: string;
  pos: Vec2; // posición en el mundo
  hidden?: boolean; // la difícil
}

/** Un espacio del mundo, definido como configuración. */
export interface SpaceDefinition {
  id: string; // 'codigo' | 'juegos' | 'lectura'…
  label: string; // 'DROPE CÓDIGO'
  accent: PaletteColor; // color de zona (Style Bible)
  rect: WorldRect; // posición + tamaño (área de proximidad, alrededor del anchor)
  anchor: SpriteRef; // objeto hero (monitor, arcade…)
  dataKey?: string; // qué slice de WorldState.data lee
  panel: PanelId; // qué panel React lo renderiza
  drops?: DropDefinition[]; // coleccionables del espacio
  spawnFor?: VisitorClass[]; // qué clases aparecen cerca
  welcome?: Partial<Record<VisitorClass, string>>; // bienvenida por clase
}

/** Una clase de visitante: cambia el spawn y el marco de bienvenida. */
export interface ClassDefinition {
  id: VisitorClass;
  label: string; // 'Reclutador'
  tagline: string; // frase corta para el onboarding
  spawn: Vec2; // dónde aparece en el mundo al elegir esta clase
}
