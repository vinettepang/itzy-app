import { Link } from 'react-router-dom';
import { WORKS_IMAGES } from '../data/siteData';
import { useFacilLocale } from '../context/FacilLocaleContext';

export default function FacilWorksPage() {
  const { t, path, locale } = useFacilLocale();
  const sliderImages = [...WORKS_IMAGES, ...WORKS_IMAGES];

  return (
    <article className="works" data-page="works">
      <header className="header-page --fixed">
        <h1 className="description">
          <p>
            {locale === 'es' ? 'Volver a ' : 'Back to '}
            <Link to={path()} className="facil-font">
              {t('works.back')}
            </Link>
          </p>
        </h1>
      </header>

      <section className="widget-projects" data-scroll-item>
        <div className="widget-projects__viewer">
          <div className="viewer">
            {WORKS_IMAGES.map((src) => (
              <div key={src} className="widget-projects__item">
                <img src={src} alt="" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
        <div className="widget-projects__slider">
          <div className="holder">
            {sliderImages.map((src, i) => (
              <div key={`s-${i}`} className="widget-projects__scroller">
                <img src={src} alt="" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}
