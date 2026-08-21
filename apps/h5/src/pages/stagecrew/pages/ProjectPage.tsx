import { Link, useParams } from 'react-router-dom';
import type { CSSProperties } from 'react';
import projects from '../data/projects.json';
import site from '../data/site.json';
import { SC_BASE } from '../StagecrewLayout';
import { StagecrewMedia } from '../StagecrewMedia';

export default function StagecrewProjectPage() {
  const { slug = '' } = useParams();
  const project = (projects as Record<string, (typeof site.projects)[number]>)[slug];
  const list = site.projects.filter((p) => !p.isComingSoon);
  const idx = list.findIndex((p) => p.slug === slug);
  const next = idx >= 0 && idx < list.length - 1 ? list[idx + 1] : list[0];

  if (!project || project.isComingSoon) {
    return (
      <section className="sc-page">
        <p>Project not found.</p>
        <Link to={SC_BASE}>Back to Work</Link>
      </section>
    );
  }

  return (
    <section className="sc-project">
      <h1 className="sc-project__masthead">
        {project.title}
        {project.subtitle ? ` / ${project.subtitle}` : ''}
      </h1>

      <div className="sc-project__body">
        <aside className="sc-project__info">
          <div className="sc-project__info-inner">
            <h2 className="sc-info-page__h">
              <span className="sc-info-page__num">1.</span>
              <span>Project Info</span>
            </h2>
            <div className="sc-project__text" dangerouslySetInnerHTML={{ __html: project.text }} />
            <ul className="sc-project__areas-list">
              {project.areas.map((a) => (
                <li key={a}> + {a}</li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="sc-project__gallery">
          {project.gallery.map((item, i) => {
            const w = item.width || 1600;
            const h = item.height || 1000;
            const wide = w / h > 1.35 || i === 0;
            return (
              <div
                key={`${item.id}-${i}`}
                className={`sc-project__shot${wide ? ' is-wide' : ''}`}
                style={
                  item.width && item.height
                    ? ({ '--sc-ar': `${item.width} / ${item.height}` } as CSSProperties)
                    : undefined
                }
              >
                <StagecrewMedia media={item} alt="" />
              </div>
            );
          })}
        </div>
      </div>

      {next ? (
        <nav className="sc-project__next" aria-label="Next project">
          <span>Next Project</span>
          <Link to={`${SC_BASE}/work/${next.slug}`} className="sc-project__nav-link">
            {next.title}
          </Link>
        </nav>
      ) : null}
    </section>
  );
}
