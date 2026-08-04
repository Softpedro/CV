// content/index.ts — superficie pública de la config data-driven.
export type { SpaceDefinition, DropDefinition, ClassDefinition, PanelId } from './types';
export { spaces, spaceCenter, spaceForClass, drops, visibleDropCount } from './spaceRegistry';
export { classes, classById } from './classes';
