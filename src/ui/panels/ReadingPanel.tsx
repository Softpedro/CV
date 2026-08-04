// ui/panels/ReadingPanel.tsx — DROPE LECTURA. Lee data['book'] del worldStore.
import type { FC } from 'react';
import { useWorldData } from '../../data';
import type { PanelProps } from '../../content/panelRegistry';

interface BookData {
  title?: string;
  progress?: number; // 0..1
  note?: string;
}

export const ReadingPanel: FC<PanelProps> = ({ space }) => {
  const book = useWorldData<BookData>(space.dataKey ?? 'book');
  if (!book) return <p className="panel-empty">Nada en la mesa de lectura ahora.</p>;

  const pct = Math.round((book.progress ?? 0) * 100);
  return (
    <div className="panel-body">
      <h3>{book.title ?? 'Sin título'}</h3>
      <div className="progress">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="panel-stat">{pct}% leído</p>
      {book.note ? <blockquote className="panel-note">{book.note}</blockquote> : null}
    </div>
  );
};
