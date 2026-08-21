import site from '../data/site.json';
import { StagecrewMedia } from '../StagecrewMedia';

type Item = NonNullable<(typeof site.backstage)['items']>[number];

export default function StagecrewBackstagePage() {
  const page = site.backstage;
  const items = (page.items || []) as Item[];
  const cols: Item[][] = [[], [], []];
  for (const item of items) {
    const idx = Math.max(0, Math.min(2, Number(item.column || 1) - 1));
    cols[idx].push(item);
  }

  return (
    <section className="sc-info-page sc-backstage">
      <div className="sc-backstage__intro">
        <h1 className="sc-info-page__h">
          <span className="sc-info-page__num">1.</span>
          <span>{page.title}</span>
        </h1>
        <div className="sc-info-page__indent" dangerouslySetInnerHTML={{ __html: page.text }} />
      </div>

      <div className="sc-backstage__cols">
        {cols.map((col, ci) => (
          <div key={ci} className="sc-backstage__col">
            {col.map((item) => {
              const m = item.media;
              const ar =
                m?.width && m?.height ? `${m.width} / ${m.height}` : m?.type === 'video' ? '1 / 1' : undefined;
              return (
                <article key={`${item.sort}-${item.title}`} className="sc-backstage__card">
                  <div className="sc-backstage__media" style={ar ? { aspectRatio: ar } : undefined}>
                    <StagecrewMedia media={m} alt="" />
                  </div>
                  <div className="sc-backstage__meta">
                    <p className="sc-backstage__info">{item.info}</p>
                    <p className="sc-backstage__title">{item.title}</p>
                  </div>
                </article>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
