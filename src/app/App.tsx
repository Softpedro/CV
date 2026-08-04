// app/App.tsx — monta el canvas del engine + overlays React encima.
// React lee/escribe SOLO los stores de Zustand; nunca toca el stage de Pixi.

import { useEffect, useRef, useState } from 'react';
import { bootstrap, type EngineHandle } from './bootstrap';
import { TouchPad } from '../ui/TouchPad';
import { Onboarding } from '../ui/Onboarding';
import { HUD } from '../ui/HUD';
import { InteractionPrompt } from '../ui/InteractionPrompt';
import { SpacePanel } from '../ui/SpacePanel';
import { CVEscape } from '../ui/CVEscape';
import { useWorldStore, useGameStore } from '../data';

const hasTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<EngineHandle | null>(null);
  const [ready, setReady] = useState(false);
  const visitorClass = useGameStore((s) => s.visitorClass);

  // Carga de datos: hidrata el world store desde world-state.json.
  useEffect(() => {
    void useWorldStore.getState().load();
    if (import.meta.env.DEV) {
      (globalThis as { __stores?: unknown }).__stores = { world: useWorldStore, game: useGameStore };
    }
    return () => {
      if (import.meta.env.DEV) delete (globalThis as { __stores?: unknown }).__stores;
    };
  }, []);

  // Interacción con espacios: E abre el panel de la zona cercana; Escape cierra.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const g = useGameStore.getState();
      if (e.key === 'e' || e.key === 'E') {
        if (g.visitorClass && g.nearZone && !g.openPanel && !g.cvOpen) g.setOpenPanel(g.nearZone);
      } else if (e.key === 'Escape') {
        if (g.openPanel) g.setOpenPanel(null);
        else if (g.cvOpen) g.setCvOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Engine.
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let handle: EngineHandle | null = null;
    let alive = true;

    bootstrap(mount).then((h) => {
      if (!alive) {
        h.destroy();
        return;
      }
      handle = h;
      engineRef.current = h;
      setReady(true);
      if (import.meta.env.DEV) (globalThis as { __drope?: unknown }).__drope = h;
    });

    return () => {
      alive = false;
      handle?.destroy();
      engineRef.current = null;
      const g = globalThis as { __drope?: unknown };
      if (import.meta.env.DEV && g.__drope === handle) delete g.__drope;
    };
  }, []);

  return (
    <div className="world-root">
      <div ref={mountRef} className="canvas-mount" />
      {ready && (
        <>
          <HUD />
          <InteractionPrompt />
          <SpacePanel />
          <Onboarding />
          {hasTouch && visitorClass && <TouchPad onMove={(d) => engineRef.current?.setTouch(d)} />}
        </>
      )}
      {/* Escape hatch: SIEMPRE visible, incluso durante carga/onboarding. */}
      <CVEscape />
    </div>
  );
}
