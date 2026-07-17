import { Link } from 'react-router-dom';
import FacilProjectCard from '../components/FacilProjectCard';
import { HOME_PROJECTS } from '../data/siteData';
import { MARQUEE } from '../i18n/translations';
import { useFacilLocale } from '../context/FacilLocaleContext';

export default function FacilHomePage() {
  const { t, path, locale } = useFacilLocale();
  const marquee = MARQUEE[locale];

  return (
    <article className="default home" data-page="home" data-palette="primary">
      <header className="header-page">
        <h1 className="description">
          <p>
            {t('home.intro1')}
            <br />
            {t('home.intro2')}
            <br />
            {t('home.intro3')}
            <br />
            {locale === 'es' ? (
              <>
                {t('home.intro4')}{' '}
                <Link to={path()} className="facil-font">
                  {t('home.introLink')}
                </Link>{' '}
                {t('home.intro5')}
              </>
            ) : (
              <>
                <Link to={path()} className="facil-font">
                  {t('home.introLink')}
                </Link>{' '}
                {t('home.intro5')}
              </>
            )}
          </p>
        </h1>
      </header>

      <div className="default__content-holder">
        {HOME_PROJECTS.map((p) => (
          <FacilProjectCard key={p.slug} project={p} />
        ))}

        <div className="card card-info --pos-4" data-scroll-item>
          <div
            className="holder"
            data-scroll-insider
            style={{ ['--speed' as string]: 0, ['--speed-x' as string]: -0.1 } as React.CSSProperties}
          >
            <div className="content">
              <div className="title tag">
                {locale === 'es' ? '¿Cómo es ' : 'What is '}
                <span className="facil-font">Fácil</span>
                {locale === 'es' ? '?' : ' like?'}
              </div>
              <div className="text">
                <p>{t('home.infoBody')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="facil-marquee" aria-hidden>
        {marquee.map((line) => (
          <div key={line.join('-')} className="facil-marquee__row">
            <div className="holder">
              {line.map((word, i) => (
                <span key={`${word}-${i}`} className={word === 'FACIL' ? 'facil-font __word' : '__word'}>
                  {word}
                </span>
              ))}
            </div>
          </div>
        ))}
      </section>
    </article>
  );
}
