import { Link } from 'react-router-dom';
import type { FacilProject } from '../data/siteData';
import { useFacilLocale } from '../context/FacilLocaleContext';

type Props = {
  project: FacilProject;
};

export default function FacilProjectCard({ project }: Props) {
  const { t, path } = useFacilLocale();

  return (
    <div className={`card card-project --pos-${project.pos}`} data-scroll-item scroll-item="">
      <Link
        to={`${path('projects')}/${project.slug}`}
        className="holder"
        data-scroll-insider
        scroll-insider=""
        style={
          {
            ['--speed-y' as string]: project.speedY,
            ['--speed-x' as string]: project.speedX,
          } as React.CSSProperties
        }
      >
        <div className="media">
          <figure className="media-holder" style={{ ['--aspect' as string]: project.aspect }}>
            {project.video ? (
              <video
                muted
                loop
                playsInline
                autoPlay
                preload="none"
                poster={project.poster}
                src={project.video}
              />
            ) : (
              <img src={project.image} alt={project.client} loading="lazy" />
            )}
          </figure>
        </div>
        <header>
          <div
            className="logo"
            data-scroll-insider
            scroll-insider=""
            style={{ ['--speed' as string]: project.speed } as React.CSSProperties}
          >
            <figure className="media-holder">
              <img src={project.logo} alt={project.client} loading="lazy" />
            </figure>
          </div>
          <div
            className="name"
            data-scroll-insider
            scroll-insider=""
            style={{ ['--speed' as string]: project.speed } as React.CSSProperties}
          >
            <span className="facil-font">{t('brand')}</span> {t('project.for')} {project.client}
          </div>
        </header>
      </Link>
    </div>
  );
}
