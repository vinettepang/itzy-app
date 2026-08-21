import site from '../data/site.json';
import { StagecrewMedia } from '../StagecrewMedia';

export default function StagecrewInfoPage() {
  const info = site.info;

  return (
    <section className="sc-info-page">
      <div className="sc-info-page__intro">
        <h1 className="sc-info-page__h">
          <span className="sc-info-page__num">1.</span>
          <span>{info.title}</span>
        </h1>
        <div className="sc-info-page__indent" dangerouslySetInnerHTML={{ __html: info.text }} />
      </div>

      <div className="sc-info-page__mid">
        <div className="sc-info-page__hero">
          <StagecrewMedia media={info.media} alt="" />
        </div>

        <div className="sc-info-page__pitch">
          <h1 className="sc-info-page__h sc-info-page__h--abs">
            <span className="sc-info-page__num">2.</span>
            <span>{info.title2 || 'Pitch'}</span>
          </h1>
          {info.infoLists.map((block, i) => (
            <div key={block.title} className="sc-info-page__row">
              <div className="sc-info-page__spacer" aria-hidden />
              <div className="sc-info-page__row-label">
                <h2 className="sc-info-page__num">
                  2. {i + 1}
                </h2>
                <div className="sc-info-page__row-title">{block.title}</div>
              </div>
              <div className="sc-info-page__row-list">
                {block.list.split('\n').map((line) => (
                  <div key={line}>{line}</div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <aside className="sc-info-page__mark">
          <div className="sc-info-page__mark-media">
            <StagecrewMedia media={info.media3} alt="" />
          </div>
          <div
            className="sc-info-page__mark-text"
            dangerouslySetInnerHTML={{ __html: info.text3 }}
          />
        </aside>
      </div>

      <div
        className="sc-info-page__closing"
        dangerouslySetInnerHTML={{ __html: info.text4 }}
      />
    </section>
  );
}
