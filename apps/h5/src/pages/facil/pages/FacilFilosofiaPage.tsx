import { FacilBrandText } from '../components/FacilBrandText';
import { METHODOLOGY_CARDS, METHODOLOGY_TAGS } from '../data/siteData';
import { useFacilLocale } from '../context/FacilLocaleContext';

export default function FacilFilosofiaPage() {
  const { t } = useFacilLocale();

  return (
    <article className="default metodologia" data-page="metodologia">
      <header className="header-page --fixed">
        <h1 className="description">
          <p>
            <FacilBrandText text={t('filosofia.intro1')} /> <strong>{t('filosofia.intro2')}</strong>
          </p>
        </h1>
      </header>

      <div className="default__content-holder metodologia__holder">
        <section className="block-metodologia" data-scroll-item>
          <div className="block-metodologia__viewer">
            <div className="viewer">
              {METHODOLOGY_CARDS.map((card, i) => (
                <div key={i} className="block-metodologia__item">
                  <div className="card-methodology">
                    <div className="holder">
                      {card.type === 'text' && (
                        <div className="content">
                          <div className="text">
                            <p>{card.text}</p>
                          </div>
                        </div>
                      )}
                      {card.type === 'image' && (
                        <div className="media">
                          <figure className="media-holder" style={{ ['--aspect' as string]: card.aspect }}>
                            <img src={card.src} alt="" loading="lazy" />
                          </figure>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="block-metodologia__slider">
            <div className="holder">
              {[...METHODOLOGY_CARDS, ...METHODOLOGY_CARDS].map((card, i) => (
                <div key={i} className={`block-metodologia__scroller${i === 0 ? ' --first' : ''}`}>
                  {card.type === 'image' && <img src={card.src} alt="" loading="lazy" />}
                  {card.type === 'text' && <div className="block-metodologia__scroller-text" />}
                </div>
              ))}
            </div>
          </div>

          <div className="block-metodologia__progress">
            {[...METHODOLOGY_TAGS, ...METHODOLOGY_TAGS].map((tag, i) => (
              <div key={i} className="__index" data-index={i % METHODOLOGY_TAGS.length}>
                <div className="name">
                  <span className="tag">
                    <span>
                      {tag.facil && <span className="facil-font">Fácil</span>}
                      {tag.facil ? ` ${tag.text}` : tag.text}
                    </span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}
