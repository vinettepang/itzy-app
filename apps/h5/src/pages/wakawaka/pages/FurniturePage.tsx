import { Link, useParams } from 'react-router-dom';
import furniture from '../data/furniture.json';
import { WAKA_BASE, WakaPage } from '../WakaLayout';

const FILTER_LABELS: Record<string, string> = {
  'chair-collection': 'chair collection',
  'dining-meeting-tables': 'dining + meeting tables',
  'coffee-side-tables': 'coffee + side tables',
  commercial: 'commercial',
  desks: 'desks',
  seating: 'seating',
  available: 'available',
  sold: 'sold',
  beds: 'beds',
  metal: 'metal',
  colors: 'colors',
  teahouse: 'teahouse',
  storage: 'storage',
};

type Chair = (typeof furniture.chairs)[number];

export default function WakaFurniturePage() {
  const { category } = useParams();
  const isAll = !category;
  const activeSlug = category || 'all';
  const activeLabel = isAll ? 'all' : FILTER_LABELS[category] || category.replace(/-/g, ' ');

  const byCategory = (furniture as { byCategory?: Record<string, Chair[]> }).byCategory;
  const items: Chair[] = (() => {
    if (!isAll) return byCategory?.[category] ?? furniture.chairs;
    const seen = new Set<string>();
    const all: Chair[] = [];
    for (const list of Object.values(byCategory ?? {})) {
      for (const item of list) {
        if (!item.slug || seen.has(item.slug)) continue;
        seen.add(item.slug);
        all.push(item);
      }
    }
    return all.length ? all : furniture.chairs;
  })();

  return (
    <WakaPage id="shop">
      <div className="scroll-wrapper">
        <div className="container">
          <div className="filters-container" style={{ opacity: 1 }}>
            <div className="filters__number">
              <span className="filters__number-total">{items.length}</span>
            </div>
            <div className="filters__items">
              <div className="filters__items-wrapper">
                <span className="filters__button filters__button--active">{activeLabel.split(/[\s+]/)[0]}</span>
                <nav className="filters__nav" aria-label="Furniture filters">
                  <Link
                    className={`filters__nav-item${isAll ? ' is-active' : ''}`}
                    data-category="all"
                    to={`${WAKA_BASE}/furniture`}
                  >
                    All,
                  </Link>
                  {furniture.filters.map((f, i) => {
                    const label = FILTER_LABELS[f.slug] || f.title || f.slug;
                    const last = i === furniture.filters.length - 1;
                    return (
                      <Link
                        key={f.slug}
                        className={`filters__nav-item${f.slug === activeSlug ? ' is-active' : ''}`}
                        data-category={f.slug}
                        to={`${WAKA_BASE}/furniture/${f.slug}`}
                      >
                        {label}
                        {last ? '' : ','}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>

          <div className="grid-container">
            <div className="grid">
              {items.map((chair, i) => (
                <Link
                  key={`${chair.slug}-${i}`}
                  to={`${WAKA_BASE}/${chair.slug}`}
                  data-filter={activeSlug}
                  className={`grid__item child-n${i + 1}`}
                >
                  <div className="grid__item-content">
                    <h4>n°{chair.n}</h4>
                    <h2>{chair.name}</h2>
                  </div>
                  <div className="grid__item-asset">
                    {chair.image ? (
                      <div
                        className="responsive-image is-loaded"
                        style={{ paddingTop: '125%', backgroundColor: chair.color }}
                      >
                        <img className="lazy is-active" src={chair.image} alt={chair.name} decoding="async" />
                      </div>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </WakaPage>
  );
}
