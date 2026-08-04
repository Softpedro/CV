// ui/panels/GamesPanel.tsx — DROPE JUEGOS. Agrega dota + clash + brawl del store.
import type { FC } from 'react';
import { useWorldData } from '../../data';
import type { PanelProps } from '../../content/panelRegistry';

export const GamesPanel: FC<PanelProps> = () => {
  const dota = useWorldData<{ mmrEstimate?: number; topHeroes?: string[]; lastMatchAt?: string }>('dota');
  const clash = useWorldData<{ trophies?: number; level?: number }>('clash');
  const brawl = useWorldData<{ trophies?: number }>('brawl');

  return (
    <div className="panel-body">
      <section>
        <h3>Dota 2</h3>
        <p className="panel-stat">
          MMR ~<strong>{dota?.mmrEstimate ?? '—'}</strong>
        </p>
        <div className="panel-tags">
          {(dota?.topHeroes ?? []).map((h) => (
            <span className="tag" key={h}>
              {h}
            </span>
          ))}
        </div>
      </section>
      <section className="panel-cols">
        <div>
          <h3>Clash Royale</h3>
          <p className="panel-stat">
            <strong>{clash?.trophies ?? '—'}</strong> 🏆 · nvl {clash?.level ?? '—'}
          </p>
        </div>
        <div>
          <h3>Brawl Stars</h3>
          <p className="panel-stat">
            <strong>{brawl?.trophies ?? '—'}</strong> 🏆
          </p>
        </div>
      </section>
    </div>
  );
};
