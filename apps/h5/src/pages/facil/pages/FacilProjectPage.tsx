import { Link, useParams } from 'react-router-dom';
import FacilProjectBlocks from '../components/FacilProjectBlocks';
import { getProjectDetail } from '../data/projectDetails';
import { useFacilLocale } from '../context/FacilLocaleContext';

export default function FacilProjectPage() {
  const { slug } = useParams();
  const { t, path } = useFacilLocale();
  const project = slug ? getProjectDetail(slug) : undefined;

  if (!project) {
    return (
      <article className="default">
        <header className="header-page">
          <h1 className="description">
            <p>
              {t('project.notFound')}{' '}
              <Link to={path('works')}>{t('project.viewWorks')}</Link>
            </p>
          </h1>
        </header>
      </article>
    );
  }

  return (
    <article className="default project" data-page="project" data-palette="primary" data-logo="grey">
      <section className="billboard-project" data-scroll-item>
        <header className="header-page">
          <h1 className="description">{project.intro}</h1>
          <div className="billboard-project__title">{project.title}</div>
          <div className="billboard-project__sub">
            <Link to={path()} className="facil-font">
              {t('brand')}
            </Link>{' '}
            {t('project.for')} {project.client}
          </div>
        </header>

        <div className="card card-info">
          <div className="holder" data-scroll-insider data-speed={0.1} data-speed-x={0.15}>
            <div className="content">
              <h2 className="title tag --l --default --transparent">{project.tagline}</h2>
              <div className="text">
                <p>{project.body}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="billboard-project__media" data-scroll-insider data-speed={0} data-speed-x={0}>
          <figure className="media-holder" style={{ ['--aspect' as string]: project.hero.aspect }}>
            <img src={project.hero.image} alt={project.client} loading="lazy" />
          </figure>
        </div>
      </section>

      {project.blocks.map((block, i) => (
        <FacilProjectBlocks key={i} block={block} />
      ))}
    </article>
  );
}
