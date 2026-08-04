// ui/panels/PlazaPanel.tsx — PLAZA DROPE (hub). Presencia + bienvenida por clase.
import type { FC } from 'react';
import { usePresence, useGameStore } from '../../data';
import type { PanelProps } from '../../content/panelRegistry';

export const PlazaPanel: FC<PanelProps> = ({ space }) => {
  const presence = usePresence();
  const visitorClass = useGameStore((s) => s.visitorClass);
  const live = presence?.status === 'live';
  const welcome = visitorClass ? space.welcome?.[visitorClass] : undefined;

  return (
    <div className="panel-body">
      {welcome ? <p className="panel-lead">{welcome}</p> : null}
      <p className="panel-stat">
        Pedro está{' '}
        <strong style={{ color: live ? 'var(--coral)' : 'var(--paper)' }}>
          {live ? 'aquí ahora' : 'away'}
        </strong>
        {presence?.lastActivity ? ` · ${presence.lastActivity}` : ''}
      </p>
      <p className="panel-hint">Caminá hasta un espacio y presioná E (o tap) para entrar.</p>
    </div>
  );
};
