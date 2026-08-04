// world/index.ts — superficie pública de la capa world.
export { Player } from './Player';
export type { Facing } from './Player';
export { AvatarController } from './AvatarController';
export { LocalTransport } from './movement/LocalTransport';
export type { MovementTransport, PeerState, Unsub } from './movement/MovementTransport';
