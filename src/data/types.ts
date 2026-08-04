// data/types.ts — contratos de datos del mundo. Solo tipos (los stores y el
// loader llegan en el paso 6). Esta forma es idéntica en Fase 0, 1, 2 y 3.

export type VisitorClass = 'recruiter' | 'client' | 'curious' | 'droper';

export interface PresenceState {
  status: 'live' | 'away'; // Fase 0 siempre 'away'
  lastActivity?: string; // ej. "programando" (Fase 2)
  since?: string; // ISO timestamp
}

// El front lee UN solo store con esta forma.
export interface WorldState {
  generatedAt: string; // ISO; cuándo corrió el fetcher
  presence: PresenceState;
  data: Record<string, unknown>; // keyed por adapter.key: data['github'], data['dota']…
}
