// ui/SpacePanel.tsx — panel del espacio activo. Resuelve el componente por
// panelRegistry (PanelId → componente), NUNCA con un switch/if por id.

import { useGameStore } from '../data';
import { spaces } from '../content';
import { panelRegistry } from '../content/panelRegistry';
import { accentVar } from './accent';

export function SpacePanel() {
  const openId = useGameStore((s) => s.openPanel);
  const close = useGameStore((s) => s.setOpenPanel);
  if (!openId) return null;

  const space = spaces.find((s) => s.id === openId);
  if (!space) return null;

  const Panel = panelRegistry[space.panel]; // ← resolución por registry

  return (
    <div className="panel-backdrop" onClick={() => close(null)}>
      <div
        className="panel"
        data-testid="space-panel"
        data-space={space.id}
        style={{ ['--accent' as string]: accentVar[space.accent] }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="panel-head">
          <h2>{space.label}</h2>
          <button className="panel-close" onClick={() => close(null)} aria-label="Cerrar">
            ✕
          </button>
        </header>
        {Panel ? <Panel space={space} /> : <p className="panel-empty">Panel no registrado.</p>}
      </div>
    </div>
  );
}
