// ui/Onboarding.tsx — pantalla de entrada: elegí quién sos.
// Lee las clases de content/ (no las hardcodea). Al elegir, guarda la clase en
// gameStore; el engine reacciona spawneando al avatar en la zona correcta.

import { useGameStore } from '../data';
import { classes } from '../content';

export function Onboarding() {
  const visitorClass = useGameStore((s) => s.visitorClass);
  const choose = useGameStore((s) => s.chooseClass);
  if (visitorClass) return null;

  return (
    <div className="onboarding" data-testid="onboarding">
      <div className="onboarding-inner">
        <h1 className="onboarding-title">DROPE WORLD</h1>
        <p className="onboarding-sub">¿Quién sos?</p>
        <div className="class-grid">
          {classes.map((c) => (
            <button
              key={c.id}
              className="class-card"
              data-testid={`class-${c.id}`}
              onClick={() => choose(c.id)}
            >
              <span className="class-label">{c.label}</span>
              <span className="class-tag">{c.tagline}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
