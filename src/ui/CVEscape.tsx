// ui/CVEscape.tsx — el escape hatch. Botón "Ver como CV normal" SIEMPRE visible
// (no-negociable) que abre una vista estática con el CV real. El apurado nunca
// queda atrapado en el juego.

import { useGameStore } from '../data';
import { cv } from '../content/cv';

export function CVEscape() {
  const cvOpen = useGameStore((s) => s.cvOpen);
  const setCvOpen = useGameStore((s) => s.setCvOpen);

  return (
    <>
      <button className="cv-escape-btn" data-testid="cv-escape" onClick={() => setCvOpen(true)}>
        Ver como CV normal
      </button>
      {cvOpen && <CVView onClose={() => setCvOpen(false)} />}
    </>
  );
}

function CVView({ onClose }: { onClose: () => void }) {
  return (
    <div className="cv-view" data-testid="cv-view">
      <div className="cv-topbar">
        <button className="cv-back" onClick={onClose}>
          ← Volver al mundo
        </button>
      </div>
      <article className="cv-doc">
        <header className="cv-header">
          <h1>{cv.name}</h1>
          <p className="cv-title">{cv.title}</p>
          <p className="cv-contact">
            {cv.location} · {cv.phone} · <a href={`mailto:${cv.email}`}>{cv.email}</a> ·{' '}
            <a href={cv.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          </p>
        </header>

        <p className="cv-summary">{cv.summary}</p>

        <section>
          <h2>Experiencia</h2>
          {cv.experience.map((job, i) => (
            <div className="cv-job" key={i}>
              <div className="cv-job-head">
                <strong>{job.role}</strong> · {job.company}
                <span className="cv-period">{job.period}</span>
              </div>
              <ul>
                {job.highlights.map((h, j) => (
                  <li key={j}>{h}</li>
                ))}
              </ul>
              {job.stack ? <p className="cv-stack">{job.stack}</p> : null}
            </div>
          ))}
        </section>

        <section>
          <h2>Proyectos</h2>
          <ul className="cv-projects">
            {cv.projects.map((p, i) => (
              <li key={i}>
                {p.url ? (
                  <a href={p.url} target="_blank" rel="noreferrer">
                    {p.name}
                  </a>
                ) : (
                  <strong>{p.name}</strong>
                )}{' '}
                <span className="cv-period">{p.year}</span> — {p.note}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2>Habilidades</h2>
          {cv.skills.map((s, i) => (
            <p className="cv-skill" key={i}>
              <strong>{s.label}:</strong> {s.items}
            </p>
          ))}
        </section>

        <section>
          <h2>Idiomas</h2>
          <p>{cv.languages}</p>
        </section>
      </article>
    </div>
  );
}
