import { Link, useLocation } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { HaoqiProjectFrameChrome } from './HaoqiFrameChrome';
import { getProjectBySlug, resolveProjectSlug } from './projectData';
import ProjectMarkdown from './ProjectMarkdown';
import { useHaoqiTheme } from './hooks/useHaoqiTheme';
import './haoqi.css';

export default function HaoqiProjectPage() {
  const { pathname } = useLocation();
  const slugFromPath = resolveProjectSlug(pathname);
  const project = getProjectBySlug(slugFromPath);
  const year = useMemo(() => new Date().getFullYear(), []);
  const { isDark, cycle, label } = useHaoqiTheme();
  const [sound, setSound] = useState(() => {
    try {
      return sessionStorage.getItem('haoqi_sound') !== 'off';
    } catch {
      return true;
    }
  });

  if (!project) {
    return (
      <div className={`haoqi haoqi--project${isDark ? ' haoqi--dark' : ''}`}>
        <HaoqiProjectFrameChrome
          themeLabel={label}
          onThemeCycle={cycle}
          sound={sound}
          onSoundToggle={() => setSound((s) => !s)}
        />
        <main className="haoqi__project">
          <Link className="haoqi__hoverbox" to="/haoqi">
            ← haoqi.design
          </Link>
          <p className="haoqi__proseP" style={{ marginTop: 24 }}>
            Project not found.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className={`haoqi haoqi--project${isDark ? ' haoqi--dark' : ''}`}>
      <HaoqiProjectFrameChrome
        themeLabel={label}
        onThemeCycle={cycle}
        sound={sound}
        onSoundToggle={() => setSound((s) => !s)}
      />

      <main className="haoqi__project">
        {project.tag ? (
          <p className="haoqi__workBadgeTag haoqi__projectTag">{project.tag}</p>
        ) : null}
        <h1 className="haoqi__projectTitle">{project.title}</h1>
        <p className="haoqi__projectMeta">
          <span>{project.published}</span>
          <span>{project.year}</span>
        </p>
        <div className="haoqi__projectHero">
          <img src={project.heroImg} alt={project.title} />
        </div>
        {project.links?.length ? (
          <div className="haoqi__projectLinks">
            {project.links.map((l) => (
              <a key={l.href} className="haoqi__hoverbox" href={l.href} target="_blank" rel="noreferrer">
                {l.label} ↗
              </a>
            ))}
          </div>
        ) : null}
        <ProjectMarkdown source={project.body} />
        <footer className="haoqi__projectFooter">
          <div className="haoqi__contactSocials">
            <a className="haoqi__hoverbox" href="https://twitter.com/wenhaoqi" target="_blank" rel="noreferrer">
              Twitter/X
            </a>
            <a className="haoqi__hoverbox" href="https://github.com/wenhaoqiasd" target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a className="haoqi__hoverbox" href="https://www.figma.com/@wenhaoqi" target="_blank" rel="noreferrer">
              Figma
            </a>
          </div>
          <p className="haoqi__projectCopy">HAOQI © {year}</p>
        </footer>
      </main>
    </div>
  );
}
