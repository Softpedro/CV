// data/worldStore.ts — Zustand: WorldState hidratado desde el JSON.
// Único punto de verdad de los datos del mundo. Misma forma en Fase 0/1/2/3.

import { create } from 'zustand';
import type { WorldState, PresenceState } from './types';
import { loadWorldState } from './loader';

export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

interface WorldStore {
  world: WorldState | null;
  status: LoadStatus;
  error: string | null;
  /** Hidrata directo (útil para tests o presencia en vivo en Fase 2). */
  hydrate: (ws: WorldState) => void;
  /** Fetch + hidratación desde world-state.json. */
  load: (url?: string) => Promise<void>;
}

export const useWorldStore = create<WorldStore>((set) => ({
  world: null,
  status: 'idle',
  error: null,
  hydrate: (ws) => set({ world: ws, status: 'ready', error: null }),
  load: async (url) => {
    set({ status: 'loading', error: null });
    try {
      const ws = await loadWorldState(url);
      set({ world: ws, status: 'ready' });
    } catch (e) {
      set({ status: 'error', error: e instanceof Error ? e.message : String(e) });
    }
  },
}));

// --- Selectores convenientes (los paneles del paso 7 leen de acá) ---

/** Slice de datos de un adapter (data['github'], data['dota']…). */
export const useWorldData = <T = unknown>(key: string): T | undefined =>
  useWorldStore((s) => s.world?.data[key] as T | undefined);

export const usePresence = (): PresenceState | null =>
  useWorldStore((s) => s.world?.presence ?? null);
