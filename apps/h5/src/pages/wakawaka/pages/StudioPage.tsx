import studio from '../data/studio.json';
import { WakaPage } from '../WakaLayout';

export default function WakaStudioPage() {
  const html = typeof studio.contentRaw === 'string' ? studio.contentRaw : '';

  return (
    <WakaPage id="about">
      <div className="scroll-wrapper">
        <div className="container">
          <div className="grid">
            <div className="about__header">
              <h3 className="about__label">Profile</h3>
              {html ? <div dangerouslySetInnerHTML={{ __html: html }} /> : null}
            </div>

            <div className="about__contacts">
              <h3 className="about__label">Contact</h3>
              <div className="about__contacts-container">
                <p className="about-contact__label">{studio.phoneLabel}</p>
                <p className="about-contact__value">{studio.phone}</p>
                <p className="about-contact__label">{studio.emailLabel}</p>
                <p className="about-contact__value">
                  <a href={`mailto:${studio.email}`}>{studio.email}</a>
                </p>
                <p className="about-contact__label">{studio.socialLabel}</p>
                <div className="about-contact__links">
                  {studio.socialLinks.map((l) => (
                    <a
                      key={l.linkUrl}
                      href={l.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="about-contact__link"
                    >
                      {l.linkLabel}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {studio.image ? (
              <div className="about__profile">
                <div
                  className="responsive-image is-loaded"
                  style={{ paddingTop: '125%', backgroundColor: '#848484' }}
                >
                  <img className="lazy is-active" src={studio.image} alt="Studio" decoding="async" />
                </div>
              </div>
            ) : null}

            {studio.press?.length ? (
              <div className="about__press">
                <h3 className="about__label">Selected Press</h3>
                {studio.press.map((p, i) =>
                  p.url ? (
                    <a
                      key={`${p.title}-${i}`}
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="about-press__item"
                    >
                      <span className="about-press__item-origin">{p.outlet}</span>
                      <span className="about-press__item-title">{p.title}</span>
                    </a>
                  ) : (
                    <div key={`${p.title}-${i}`} className="about-press__item">
                      <span className="about-press__item-origin">{p.outlet}</span>
                      <span className="about-press__item-title">{p.title}</span>
                    </div>
                  ),
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </WakaPage>
  );
}
