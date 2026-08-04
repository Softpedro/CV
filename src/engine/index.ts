// engine/index.ts — superficie pública del motor.
export { Renderer } from './Renderer';
export type { Layers } from './Renderer';
export { Camera } from './Camera';
export { TickLoop } from './TickLoop';
export type { UpdateFn } from './TickLoop';
export { Input } from './Input';
export { TileMap } from './TileMap';
export { Proximity } from './Proximity';
export { DropSystem } from './DropSystem';
export type { DropPoint } from './DropSystem';
export { TileAtlas } from './TileAtlas';
export type { AtlasConfig } from './TileAtlas';
export { RectsCollider, CompositeCollider, rectsOverlap } from './Colliders';
export * from './types';
