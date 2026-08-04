// data/gameStore.ts — Zustand: estado de juego/UI.
// Clase elegida (onboarding), panel abierto, y drops recogidos (la caza).
// El engine no lee esto; lo consumen la UI y (en el paso 8) el DropSystem.

import { create } from 'zustand';
import type { VisitorClass } from './types';

// openPanel guarda un PanelId (definido en content/), pero se tipa como string
// para que data/ no dependa de content/: la config depende de los datos, no al
// revés. Mantiene la dirección de dependencias hacia abajo.
interface GameStore {
  /** null = onboarding aún sin completar. */
  visitorClass: VisitorClass | null;
  /** id del espacio cuyo panel está abierto, o null. (lo escribe la UI) */
  openPanel: string | null;
  /** id del espacio más cercano al jugador, o null. (lo escribe el engine) */
  nearZone: string | null;
  /** true mientras la vista "CV normal" está abierta. */
  cvOpen: boolean;
  /** Ids de drops ya recogidos. */
  collectedDrops: Set<string>;

  chooseClass: (c: VisitorClass) => void;
  setOpenPanel: (panel: string | null) => void;
  setNearZone: (zone: string | null) => void;
  setCvOpen: (open: boolean) => void;
  collectDrop: (id: string) => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  visitorClass: null,
  openPanel: null,
  nearZone: null,
  cvOpen: false,
  collectedDrops: new Set<string>(),

  chooseClass: (c) => set({ visitorClass: c }),
  setOpenPanel: (panel) => set({ openPanel: panel }),
  setNearZone: (zone) => set((s) => (s.nearZone === zone ? s : { nearZone: zone })),
  setCvOpen: (open) => set({ cvOpen: open }),
  collectDrop: (id) =>
    set((s) => {
      if (s.collectedDrops.has(id)) return s; // idempotente
      const next = new Set(s.collectedDrops);
      next.add(id);
      return { collectedDrops: next };
    }),
  reset: () =>
    set({ visitorClass: null, openPanel: null, nearZone: null, cvOpen: false, collectedDrops: new Set() }),
}));

/** Cantidad de drops recogidos (selector reactivo). */
export const useCollectedCount = (): number => useGameStore((s) => s.collectedDrops.size);
