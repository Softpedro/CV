// data/loader.ts — fetch de world-state.json y normalización al tipo propio.
// Convención: la respuesta llega sin tipar; se mapea a WorldState de inmediato,
// con defaults defensivos para que el front nunca reciba una forma inválida.

import type { WorldState } from './types';

const DEFAULT_URL = '/world-state.json';

export async function loadWorldState(url: string = DEFAULT_URL): Promise<WorldState> {
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`world-state.json: HTTP ${res.status}`);
  return normalize((await res.json()) as unknown);
}

/** Mapea la respuesta cruda al contrato WorldState (border defensivo). */
function normalize(raw: unknown): WorldState {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const presence = (obj.presence && typeof obj.presence === 'object' ? obj.presence : {}) as Record<
    string,
    unknown
  >;
  return {
    generatedAt: typeof obj.generatedAt === 'string' ? obj.generatedAt : new Date(0).toISOString(),
    presence: {
      status: presence.status === 'live' ? 'live' : 'away',
      lastActivity: typeof presence.lastActivity === 'string' ? presence.lastActivity : undefined,
      since: typeof presence.since === 'string' ? presence.since : undefined,
    },
    data: (obj.data && typeof obj.data === 'object' ? obj.data : {}) as Record<string, unknown>,
  };
}
