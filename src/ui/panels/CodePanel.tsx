// ui/panels/CodePanel.tsx — DROPE CÓDIGO. Lee data['github'] del worldStore.
import type { FC } from 'react';
import { useWorldData } from '../../data';
import type { PanelProps } from '../../content/panelRegistry';

interface GithubData {
  recentCommits?: { repo: string; message: string; at: string }[];
  topRepos?: string[];
}

export const CodePanel: FC<PanelProps> = ({ space }) => {
  const gh = useWorldData<GithubData>(space.dataKey ?? 'github');
  if (!gh) return <p className="panel-empty">Sin datos de código todavía.</p>;

  return (
    <div className="panel-body">
      <section>
        <h3>Commits recientes</h3>
        <ul className="panel-list">
          {(gh.recentCommits ?? []).map((c, i) => (
            <li key={i}>
              <code>{c.repo}</code> — {c.message}
            </li>
          ))}
        </ul>
      </section>
      {gh.topRepos?.length ? (
        <section>
          <h3>Repos</h3>
          <div className="panel-tags">
            {gh.topRepos.map((r) => (
              <span className="tag" key={r}>
                {r}
              </span>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
};
