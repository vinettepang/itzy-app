import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import products from '../data/products.json';
import ProductCanvas from '../ProductCanvas';
import { WAKA_BASE, WakaPage } from '../WakaLayout';

type Product = (typeof products)[keyof typeof products];

export default function WakaProductPage() {
  const { slug = '' } = useParams();
  const product = (products as Record<string, Product | undefined>)[slug];
  const [infoOpen, setInfoOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [view, setView] = useState<'default' | 'zoom'>('default');
  const [cursor, setCursor] = useState<{ label: 'LARGER' | 'SMALLER'; x: number; y: number } | null>(null);

  const onToggleZoom = useCallback(() => {
    if (infoOpen) return;
    setView((v) => (v === 'default' ? 'zoom' : 'default'));
  }, [infoOpen]);

  const onCursor = useCallback((label: 'LARGER' | 'SMALLER' | null, x: number, y: number) => {
    if (!label) {
      setCursor(null);
      return;
    }
    setCursor({ label, x, y });
  }, []);

  if (!product) {
    return (
      <WakaPage className="not-found">
        <div className="container" style={{ padding: '20vh 20px' }}>
          <h1>Not the page you are lookig for</h1>
          <p>
            <Link to={WAKA_BASE}>Back home</Link>
          </p>
        </div>
      </WakaPage>
    );
  }

  const typeLabel =
    typeof product.chairType === 'string'
      ? product.chairType
      : (product.chairType as { key?: string } | undefined)?.key;
  const canZoom = typeLabel === 'Chair Collection';
  const gallery = product.gallery ?? [];

  return (
    <WakaPage id="product" className={`${infoOpen ? 'is-info-open' : ''} ${canZoom ? '' : 'cant-zoom'}`.trim()}>
      <div className="page-wrapper--anim">
        <Link to={`${WAKA_BASE}/furniture/chair-collection`} className="product__close is-visible" aria-label="Close product">
          <span className="product__close-bar">
            <span className="product__close-background" />
          </span>
          <span className="product__close-bar">
            <span className="product__close-background" />
          </span>
        </Link>
        <Link to={`${WAKA_BASE}/furniture/chair-collection`} className="product__back">
          back
        </Link>

        {canZoom ? (
          <button type="button" className="product__pause-button" onClick={() => setPaused((p) => !p)}>
            {paused ? 'Play' : 'Pause'}
          </button>
        ) : null}

        <div className="product-hover-area" aria-hidden />

        <div className="product-assets">
          {canZoom && gallery.length ? (
            <ProductCanvas
              images={gallery}
              paused={paused || infoOpen}
              view={view}
              onToggleZoom={onToggleZoom}
              onCursor={onCursor}
            />
          ) : gallery[0]?.url ? (
            <div
              className="responsive-image is-loaded"
              style={{ backgroundColor: gallery[0].color || '#848484' }}
            >
              <img className="lazy is-active" src={gallery[0].url} alt={product.name} decoding="async" />
            </div>
          ) : null}
        </div>

        {cursor ? (
          <div className="waka-pdp-cursor" style={{ transform: `translate(${cursor.x + 16}px, ${cursor.y + 16}px)` }}>
            {cursor.label}
          </div>
        ) : null}

        <div className="product-content">
          <div className="product-content__headline">
            <h1>{product.name}</h1>
            {product.dimensions ? <h2>({product.dimensions})</h2> : null}
            <button
              type="button"
              className="product-content__button--info"
              onClick={() => {
                setInfoOpen(true);
                setView('default');
              }}
            >
              Info
            </button>
            <button type="button" className="product-content__button--close" onClick={() => setInfoOpen(false)}>
              Close
            </button>
          </div>

          <div className={`product-content__body${infoOpen ? ' is-open' : ''}`}>
            <div className="product-content__body-grid">
              <div className="product-content__body-desc">
                {product.description ? <p>{product.description}</p> : null}
              </div>
              <div className="product-content__info">
                {product.infos?.length ? (
                  <ul>
                    {product.infos.map((row) => (
                      <li key={row.key}>
                        <h5>{row.key}</h5>
                        <p>{row.value}</p>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {product.specSheet ? (
                  <a
                    className="product-content__info-link"
                    href={product.specSheet}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Spec Sheet
                  </a>
                ) : null}
              </div>
              <div className="product-content__purchase">
                <a className="cta" href="mailto:info@wakawaka.world">
                  Contact for purchase
                </a>
              </div>
            </div>
          </div>

          {product.next?.slug ? (
            <div className="product-content__next">
              <Link className="product-next" to={`${WAKA_BASE}/${product.next.slug}`}>
                {product.next.image ? (
                  <div
                    className="responsive-image is-loaded"
                    style={{
                      paddingTop: '125%',
                      backgroundColor: product.next.color || '#a68367',
                      width: 144,
                    }}
                  >
                    <img className="lazy is-active" src={product.next.image} alt={product.next.name} decoding="async" />
                  </div>
                ) : (
                  <span>Next: {product.next.name}</span>
                )}
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </WakaPage>
  );
}
