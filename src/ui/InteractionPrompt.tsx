// ui/InteractionPrompt.tsx — aviso "Entrar" cuando el jugador está cerca de un
// espacio. Unificado desktop + móvil: muestra el hint de tecla E y es tappeable.
// Lee nearZone (que escribe el engine) del gameStore.

import { useGameStore } from '../data';
import { spaces } from '../content';
import { accentVar } from './accent';

export function InteractionPrompt() {
  const visitorClass = useGameStore((s) => s.visitorClass);
  const nearZone = useGameStore((s) => s.nearZone);
  const openPanel = useGameStore((s) => s.openPanel);
  const open = useGameStore((s) => s.setOpenPanel);
  if (!visitorClass || !nearZone || openPanel) return null;

  const space = spaces.find((s) => s.id === nearZone);
  if (!space) return null;

  return (
    <button
      className="interact-prompt"
      data-testid="interact-prompt"
      style={{ ['--accent' as string]: accentVar[space.accent] }}
      onClick={() => open(nearZone)}
    >
      Entrar a <strong>{space.label}</strong> <kbd>E</kbd>
    </button>
  );
}
