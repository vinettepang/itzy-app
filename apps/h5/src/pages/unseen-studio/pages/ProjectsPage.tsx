import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { UnseenStudioPage, type UnseenOutletCtx } from '../UnseenStudioLayout';
import ProjectMenuCanvas from '../components/ProjectMenuCanvas';
import { PROJECT_FILTERS, type ProjectItem } from '../data/types';
import projectsData from '../data/projects.slim.json';

const projects = projectsData as ProjectItem[];

export default function UnseenStudioProjectsPage() {
  const { phaseEntered } = useOutletContext<UnseenOutletCtx>();
  const [filter, setFilter] = useState<string>('all');
  const [uiEntered, setUiEntered] = useState(false);

  useEffect(() => {
    const onUi = () => setUiEntered(true);
    window.addEventListener('us-projects-enter-ui', onUi);
    return () => window.removeEventListener('us-projects-enter-ui', onUi);
  }, []);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const f of PROJECT_FILTERS) map[f.id] = 0;
    map.all = projects.filter((p) => {
      const cats = p.categories ?? [];
      return cats.length === 0 || !cats.includes('experiment');
    }).length;
    for (const p of projects) {
      for (const c of p.categories ?? []) {
        if (map[c] != null) map[c] += 1;
      }
    }
    return map;
  }, []);

  return (
    <UnseenStudioPage title="Projects" variant="projects">
      <div className={`us-projects us-projects--webgl${uiEntered ? ' is-entered' : ''}`}>
        <ProjectMenuCanvas active={phaseEntered} projects={projects} filter={filter} />

        <div className="us-projects__filters">
          <h2 className="us-projects__title">Selected Projects</h2>
          <div className="us-projects__filter-list" role="tablist" aria-label="Project filters">
            {PROJECT_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={filter === f.id}
                className={`us-projects__filter-btn${filter === f.id ? ' is-active' : ''}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
                <span className="us-projects__filter-n">{counts[f.id] ?? 0}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="us-projects__hint" aria-hidden>
          Scroll to explore
        </div>

        <div className="us-projects__cta">
          <p>Looking for a creative partner for your project?</p>
          <a className="us-btn" href="mailto:projects@unseen.co">
            projects@unseen.co
          </a>
        </div>
      </div>
    </UnseenStudioPage>
  );
}
