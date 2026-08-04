// ui/HUD.tsx — semáforo de disponibilidad + clase actual.
// Lee presencia del worldStore y la clase del gameStore. Coral SOLO si Pedro
// está live (Style Bible: coral = "está aquí ahora", nunca decorativo).

import { usePresence, useGameStore } from '../data';
import { classById, drops, visibleDropCount } from '../content';

export function HUD() {
  const presence = usePresence();
  const visitorClass = useGameStore((s) => s.visitorClass);
  const collected = useGameStore((s) => s.collectedDrops);
  if (!visitorClass) return null; // se muestra después del onboarding

  const cls = classById[visitorClass];
  const live = presence?.status === 'live';

  // La caza: cuenta solo drops visibles contra el total; la oculta es un extra
  // (✦) que no revela su existencia hasta encontrarla.
  const visibleFound = drops.filter((d) => !d.hidden && collected.has(d.id)).length;
  const secretFound = drops.some((d) => d.hidden && collected.has(d.id));

  return (
    <div className="hud" data-testid="hud">
      <div className="hud-presence">
        <span className={`hud-dot ${live ? 'live' : 'away'}`} />
        <span>
          Pedro está {live ? 'aquí ahora' : 'away'}
          {presence?.lastActivity ? ` · ${presence.lastActivity}` : ''}
        </span>
      </div>
      <div className="hud-class">Entraste como {cls?.label}</div>
      <div className="hud-drops" data-testid="hud-drops" data-count={visibleFound} data-secret={secretFound}>
        <span className="hud-drop-glyph">◆</span>
        <span>
          {visibleFound}/{visibleDropCount}
          {secretFound ? ' ✦' : ''}
        </span>
      </div>
    </div>
  );
}
