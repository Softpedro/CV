// data/index.ts — superficie pública de la capa de datos.
export type { WorldState, PresenceState, VisitorClass } from './types';
export { loadWorldState } from './loader';
export { useWorldStore, useWorldData, usePresence } from './worldStore';
export type { LoadStatus } from './worldStore';
export { useGameStore, useCollectedCount } from './gameStore';
