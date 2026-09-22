import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Lenis from 'lenis';
import { CLIENTS, FILTERS, FLUORO_BASE, type FluoroFilter } from './data';
import './fluoro.css';

const GRID_COLS = 18;
const ORIGIN = 'https://fluoro.london';

function MarkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M9.93413 6.23103C9.93413 6.93747 9.48245 7.51703 8.51538 7.51703H6.38726V4.94792H8.51538C9.41875 4.94792 9.93413 5.39773 9.93413 6.23392M11.4832 11.3087V9.76608C11.4832 8.67327 10.9678 8.22346 10.2584 8.03028C11.2255 7.58046 11.6135 6.8106 11.6135 5.91097C11.6135 4.62498 10.5161 3.53505 8.70937 3.53505H4.77452V12.2718H6.45096V8.86646H8.90337C9.54904 8.86646 9.80673 9.25284 9.80673 9.76608V10.7955C9.80673 11.8883 9.87043 12.2718 9.87043 12.2718H11.6772C11.4832 12.0786 11.4832 11.8854 11.4832 11.3087ZM8 14.6477C4.32284 14.6477 1.61274 11.8854 1.61274 8.03028C1.61274 4.17517 4.32284 1.34943 8 1.34943C11.6772 1.34943 14.451 4.11173 14.451 8.03028C14.451 11.9488 11.6772 14.6477 8 14.6477ZM8 15.9971C12.3865 15.9971 16 12.5918 16 8.03028C16 3.46873 12.3865 0 8 0C3.61346 0 0 3.4053 0 8.03028C0 12.6553 3.61346 16.0606 8 15.9971Z"
        fill="#fff"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="17" height="12" viewBox="0 0 17 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M9.18781 7.92555L5.54097 11.5565H10.9883L16.5293 6.02943L11.0043 0.504395L5.54097 0.504395L9.17188 4.11937L0 4.11937L0 7.92555L9.18781 7.92555Z"
        fill="#fff"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="27" viewBox="0 0 18 27" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12.0865 11.992L18 17.949L18 9.05097L8.99838 1.07305e-07L2.1435e-07 9.02494L1.07932e-07 17.949L5.88755 12.0181L5.88755 27L12.0865 27L12.0865 11.992Z"
        fill="#0000F5"
      />
    </svg>
  );
}

function Wordmark() {
  return (
    <svg width="225" height="42" viewBox="0 0 225 42" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M28.0503 9.18354V1.42663H0V40.6421H8.85385V26.2252H26.5616V18.3508H8.85385V9.18354H28.0503ZM60.88 40.6421V32.8852H41.9579V1.42663H33.104V40.6421H60.88ZM80.3115 33.8646C75.7279 33.8646 72.7896 31.3965 72.7896 26.3428V1.42663H63.9358V25.6768C63.9358 36.607 70.2823 41.2298 79.9981 41.2298C89.2829 41.2298 96.1387 36.8029 96.1387 25.8727V1.42663H87.6766V26.1861C87.6766 31.2398 84.9343 33.8646 80.3115 33.8646ZM118.979 0.799805C108.675 0.799805 100.644 8.36084 100.644 21.0931C100.644 33.8646 108.636 41.269 118.979 41.269C129.321 41.269 137.313 33.8646 137.313 21.0931C137.274 8.36084 129.282 0.799805 118.979 0.799805ZM118.979 33.6687C113.024 33.6687 109.968 28.8501 109.968 21.054C109.968 12.8269 113.063 8.32166 118.979 8.32166C124.933 8.32166 127.989 12.7878 127.989 21.054C127.989 28.8501 124.894 33.6687 118.979 33.6687ZM172.141 29.0459C172.141 25.5201 169.947 22.2684 166.382 21.3674C170.652 19.6828 172.768 16.4312 172.768 12.3568C172.768 6.32367 168.576 1.42663 159.957 1.42663H141.975V40.6421H150.829V25.3242H158.429C161.681 25.3242 163.248 27.1655 163.365 30.1821L163.522 36.2152C163.561 37.939 163.679 39.8978 164.07 40.603H173.199C172.807 39.9761 172.415 38.2132 172.376 36.842L172.141 29.0459ZM150.79 18.2333V8.59589H158.625C162.229 8.59589 164.227 10.2805 164.227 13.4538C164.227 16.3528 161.837 18.1941 158.233 18.1941L150.79 18.2333ZM194.158 0.799805C183.855 0.799805 175.823 8.36084 175.823 21.0931C175.823 33.8646 183.815 41.269 194.158 41.269C204.461 41.269 212.492 33.8646 212.492 21.0931C212.453 8.36084 204.461 0.799805 194.158 0.799805ZM194.158 33.6687C188.203 33.6687 185.147 28.8501 185.147 21.054C185.147 12.8269 188.242 8.32166 194.158 8.32166C200.113 8.32166 203.168 12.7878 203.168 21.054C203.168 28.8501 200.074 33.6687 194.158 33.6687ZM224.285 40.6421V31.4749H215V40.603L224.285 40.6421Z"
        fill="#fff"
      />
    </svg>
  );
}

export default function FluoroPage() {
  const [filter, setFilter] = useState<FluoroFilter>('All');
  const [openKey, setOpenKey] = useState<number | null>(null);
  const [gridOn, setGridOn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoverImg, setHoverImg] = useState('');
  const [modelOn, setModelOn] = useState(false);
  const [viewOn, setViewOn] = useState(false);
  const modelRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const pos = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  const clients = useMemo(
    () =>
      filter === 'All' ? CLIENTS : CLIENTS.filter((client) => client.tags.includes(filter)),
    [filter],
  );

  useEffect(() => {
    document.title = 'Index - FLUORO®';
    const html = document.documentElement;
    const body = document.body;
    html.classList.add('fluoro-html', 'lenis', 'lenis-smooth');
    body.classList.add('fluoro-body');
    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.88,
      touchMultiplier: 1.1,
    });
    return () => {
      lenis.destroy();
      html.classList.remove('fluoro-html', 'lenis', 'lenis-smooth');
      body.classList.remove('fluoro-body');
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const footer = footerRef.current;
    if (!root || !footer) return;

    const syncFooter = () => {
      root.style.setProperty('--fluoro-footer-h', `${Math.round(footer.getBoundingClientRect().height)}px`);
    };
    syncFooter();
    const observer = new ResizeObserver(syncFooter);
    observer.observe(footer);
    window.addEventListener('resize', syncFooter);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', syncFooter);
    };
  }, [filter]);

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      pos.current.tx = event.clientX;
      pos.current.ty = event.clientY;
    };
    window.addEventListener('mousemove', onMove);
    let frame = 0;
    const tick = () => {
      pos.current.x += (pos.current.tx - pos.current.x) * 0.2;
      pos.current.y += (pos.current.ty - pos.current.y) * 0.2;
      const x = `${pos.current.x}px`;
      const y = `${pos.current.y}px`;
      if (modelRef.current) {
        modelRef.current.style.left = x;
        modelRef.current.style.top = y;
      }
      if (viewRef.current) {
        viewRef.current.style.left = x;
        viewRef.current.style.top = y;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  useEffect(() => {
    if (openKey === null) return;
    const node = contentRefs.current[openKey];
    if (!node) return;
    const sync = () => {
      node.style.maxHeight = `${node.scrollHeight}px`;
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(node);
    return () => observer.disconnect();
  }, [openKey, filter]);

  const toggleSection = (index: number) => {
    setOpenKey((current) => {
      if (current !== null && current !== index) {
        const prev = contentRefs.current[current];
        if (prev) prev.style.maxHeight = '0px';
      }
      if (current === index) {
        const node = contentRefs.current[index];
        if (node) node.style.maxHeight = '0px';
        return null;
      }
      return index;
    });
  };

  const onFilter = (next: FluoroFilter) => {
    setFilter(next);
    setOpenKey(null);
    setModelOn(false);
    setViewOn(false);
    Object.values(contentRefs.current).forEach((node) => {
      if (node) node.style.maxHeight = '0px';
    });
  };

  return (
    <div ref={rootRef} className={`fluoro-root${menuOpen ? ' is-menu-active' : ''}`}>
      <header className={`fluoro-header${menuOpen ? ' is-menu-active' : ''}`}>
        <div className="fluoro-container">
          <Link to={FLUORO_BASE} title="FLUORO®" className="fluoro-header__logo">
            <img src="/fluoro/assets/fluoro-logo-blue.gif" alt="Fluoro" />
          </Link>
          <div className="fluoro-header__tagline">
            <span>Say what you mean, do what you love and fucking send it</span>
            <MarkIcon />
          </div>
          <nav className="fluoro-header__nav">
            <ul>
              <li>
                <a href={`${ORIGIN}/`}>Showcase.</a>
              </li>
              <li className="is-current">
                <Link to={FLUORO_BASE} aria-current="page">
                  Index.
                </Link>
              </li>
              <li>
                <a href={`${ORIGIN}/studio/`}>Studio.</a>
              </li>
              <li>
                <a href={`${ORIGIN}/contact/`}>Contact.</a>
              </li>
            </ul>
            <div className="fluoro-header__contact">
              <div>
                <a href="mailto:studio@fluoro.london" className="fluoro-header__email">
                  <MailIcon />
                  studio@fluoro.london
                </a>
                <a href="tel:+44 (0)20 3488 3111" className="fluoro-header__phone">
                  +44 (0)20 3488 3111
                </a>
              </div>
              <div>
                <a
                  href="https://www.instagram.com/fluoro.london/"
                  title="Instagram"
                  target="_blank"
                  rel="noreferrer"
                  className="fluoro-btn-pill"
                >
                  Instagram
                </a>
              </div>
              <button
                type="button"
                className="fluoro-header__close"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              >
                <CloseIcon />
              </button>
            </div>
          </nav>
          <button type="button" className="fluoro-header__menu-btn" onClick={() => setMenuOpen(true)}>
            Menu
          </button>
        </div>
      </header>

      <main className="fluoro-wrapper">
        <div className="fluoro-project-index">
          <div className="fluoro-container">
            <div className="fluoro-filters">
              <ul>
                {FILTERS.map((item) => (
                  <li key={item}>
                    <button
                      type="button"
                      className={`fluoro-btn-pill${filter === item ? ' is-active' : ''}`}
                      onClick={() => onFilter(item)}
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="fluoro-accordion">
              {clients.map((client, index) => {
                const open = openKey === index;
                return (
                  <section key={client.name} className="fluoro-accordion__section">
                    <div
                      className={`fluoro-accordion__tab${open ? ' is-active' : ' is-closed'}`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                      onClick={() => toggleSection(index)}
                      onMouseEnter={() => {
                        if (client.hoverImg) {
                          setHoverImg(client.hoverImg);
                          setModelOn(true);
                        }
                      }}
                      onMouseLeave={() => setModelOn(false)}
                    >
                      <span>{client.name}</span>
                      <ul className="fluoro-project-tags">
                        {client.tags.map((tag) => (
                          <li key={tag}>
                            <a className="fluoro-btn-pill">{tag}</a>
                          </li>
                        ))}
                      </ul>
                      <div className="fluoro-accordion__tab-label">
                        <span>Expand</span>
                      </div>
                    </div>
                    <div
                      className="fluoro-accordion__content"
                      ref={(node) => {
                        contentRefs.current[index] = node;
                      }}
                    >
                      {client.galleries.map((gallery) => (
                        <div key={gallery.href}>
                          <a
                            href={gallery.href}
                            title={gallery.title}
                            className="fluoro-gallery"
                            onMouseEnter={() => {
                              setModelOn(false);
                              setViewOn(true);
                            }}
                            onMouseLeave={() => setViewOn(false)}
                          >
                            {gallery.images.map((src) => (
                              <div className="fluoro-lazy" key={src}>
                                <img src={src} alt="" loading="lazy" decoding="async" />
                              </div>
                            ))}
                          </a>
                          <span>{gallery.title}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <footer ref={footerRef} className="fluoro-footer">
        <div className="fluoro-container">
          <div className="fluoro-footer__lede">
            <p>Replacing luxury&nbsp;and glamour with&nbsp;intrigue and attitude</p>
          </div>
          <ul className="fluoro-footer__contact">
            <li>
              <a href="mailto:studio@fluoro.london">studio@fluoro.london</a>
            </li>
            <li>
              <a href="tel:+44 (0)20 3488 3111">+44 (0)20 3488 3111</a>
            </li>
            <li>
              <a href="https://www.instagram.com/fluoro.london/" title="Instagram" target="_blank" rel="noreferrer">
                Instagram
              </a>
            </li>
          </ul>
          <div className="fluoro-footer__logo">
            <Wordmark />
            <span>®</span>
          </div>
          <span className="fluoro-footer__copyright">© Fluoro Ltd. 2026</span>
          <a href={`${ORIGIN}/terms-conditions/`} title="Terms & Conditions" className="fluoro-footer__terms">
            Terms &amp; Conditions
          </a>
        </div>
      </footer>

      <div className={`fluoro-grid-overlay${gridOn ? ' is-active' : ''}`}>
        {Array.from({ length: GRID_COLS }, (_, i) => (
          <span key={i} />
        ))}
      </div>
      <button type="button" className="fluoro-btn-pill fluoro-grid-toggle" onClick={() => setGridOn((v) => !v)}>
        {gridOn ? 'Grid off' : 'Grid on'}
      </button>

      <div ref={modelRef} className={`fluoro-model${modelOn && hoverImg ? ' is-on' : ''}`}>
        {hoverImg ? <img src={hoverImg} alt="" /> : null}
      </div>
      <div ref={viewRef} className={`fluoro-view-project${viewOn ? ' is-on' : ''}`}>
        View Project
      </div>
    </div>
  );
}
