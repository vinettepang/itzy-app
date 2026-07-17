import { FacilBrandText } from '../components/FacilBrandText';
import { TEAM } from '../data/siteData';
import { useFacilLocale } from '../context/FacilLocaleContext';

export default function FacilPeoplePage() {
  const { t } = useFacilLocale();

  return (
    <article className="default about" data-page="about">
      <header className="header-page">
        <h1 className="description">
          <p>
            <FacilBrandText text={t('people.intro')} />
          </p>
        </h1>
      </header>

      <section className="widget-team">
        {TEAM.map((person) => (
          <div key={person.name} className="card-person" data-scroll-item>
            <div
              className="holder"
              data-scroll-insider
              style={
                {
                  ['--speed' as string]: person.speed,
                  ['--speed-x' as string]: person.speedX,
                  ['--x' as string]: `calc((var(--y) * (${person.speedX} * var(--mod-x, 1))) * -1px)`,
                } as React.CSSProperties
              }
            >
              <div className="media">
                <figure className="media-holder">
                  <img src={person.image} alt={person.name} loading="lazy" />
                </figure>
              </div>
              <header>
                <div
                  className="name"
                  data-scroll-insider
                  style={{ ['--speed' as string]: person.speed } as React.CSSProperties}
                >
                  {person.name}
                </div>
              </header>
            </div>
          </div>
        ))}
      </section>
    </article>
  );
}
