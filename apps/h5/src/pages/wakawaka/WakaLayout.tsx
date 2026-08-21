import { useEffect, useLayoutEffect, useMemo, useState, type ReactNode, type Ref } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import site from './data/site.json';
import WakaMark from './WakaMark';
import './wakawaka.prod.css';
import './wakawaka.css';

const BASE = '/wakawaka';

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function useLaClock() {
  const [text, setText] = useState('--:--');
  useEffect(() => {
    const tick = () => {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Los_Angeles',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).formatToParts(new Date());
      const h = parts.find((p) => p.type === 'hour')?.value ?? '00';
      const m = parts.find((p) => p.type === 'minute')?.value ?? '00';
      setText(`${pad2(Number(h))}:${pad2(Number(m))}`);
    };
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);
  return text;
}

export default function WakaLayout() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const time = useLaClock();
  const isHome = location.pathname === BASE || location.pathname === `${BASE}/`;

  // Before paint so home hide/intro CSS matches the route immediately
  useLayoutEffect(() => {
    const html = document.documentElement;
    html.classList.add('is-wakawaka');
    html.classList.toggle('is-homepage', isHome);
    if (!isHome) {
      html.classList.remove('is-intro', 'is-intro-done');
    }
    html.setAttribute('type', isHome ? 'homepage' : '');
    html.setAttribute('location', isHome ? 'index' : location.pathname.replace(/^\/wakawaka\/?/, '') || 'index');
    html.style.background = '#edeae4';
    document.body.style.background = '#edeae4';
    document.body.style.color = '#28282a';
    return () => {
      html.classList.remove('is-wakawaka', 'is-homepage', 'is-intro', 'is-intro-done');
      html.removeAttribute('type');
      html.removeAttribute('location');
      html.style.background = '';
      document.body.style.background = '';
      document.body.style.color = '';
      document.body.style.perspective = '';
      document.body.style.perspectiveOrigin = '';
      document.body.style.overflow = '';
      document.body.style.height = '';
      const root = document.getElementById('root');
      if (root) {
        root.style.perspective = '';
        root.style.perspectiveOrigin = '';
        root.style.transformStyle = '';
        root.style.height = '';
        root.style.overflow = '';
      }
    };
  }, [isHome, location.pathname]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const nav = useMemo(
    () => [
      { to: `${BASE}/furniture/chair-collection`, label: 'Furniture', page: 'furniture' },
      { to: `${BASE}/catalogue`, label: 'Index', page: 'catalogue' },
      { to: `${BASE}/studio`, label: 'Studio', page: 'about' },
    ],
    [],
  );

  return (
    <>
      <div className={`waka-app site${menuOpen ? ' is-menu-open' : ''}`}>
        <a className="skip-link" href="#content">
          Skip to content
        </a>

        <header id="site-header" style={{ opacity: 1 }}>
          <div className="site-header__left">
            <h2 className="logo">
              <Link to={BASE}>Waka Waka</Link>
            </h2>
          </div>
          <nav className="header-nav site-header__center" aria-label="Primary">
            {nav.map((item, i) => (
              <NavLink key={item.to} to={item.to} data-page={item.page}>
                {item.label}
                {i < nav.length - 1 ? ', ' : ''}
              </NavLink>
            ))}
          </nav>
          <div className="site-header__right">
            <h2 className="header-info">
              <span className="location">los angeles, ca</span>
              &nbsp;
              <span className="time">{time}</span>
              <button
                type="button"
                className="menu-dot-button menu-dot-container"
                aria-label="Open menu"
                onClick={() => setMenuOpen(true)}
              >
                <svg width="12" className="menu-dot" viewBox="0 0 12 12" aria-hidden>
                  <circle cx="6" cy="6" r="6" />
                </svg>
              </button>
            </h2>
          </div>
          <button
            type="button"
            className="menu-dot-button menu-dot-container--mobile"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <svg width="16" className="menu-dot" viewBox="0 0 16 16" aria-hidden>
              <circle cx="8" cy="8" r="8" />
            </svg>
          </button>
        </header>

        <div className={`fullscreen-menu-container${menuOpen ? ' is-open' : ''}`} hidden={!menuOpen}>
          <div className="fullscreen-menu">
            <button
              type="button"
              className="menu-dot-button menu-dot-container"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
            >
              <svg className="menu-dot" viewBox="0 0 12 12" aria-hidden>
                <circle cx="6" cy="6" r="6" />
              </svg>
            </button>
            <nav className="fullscreen-menu__nav">
              <Link className="fullscreen-menu__nav-item-home" to={BASE} onClick={() => setMenuOpen(false)}>
                <span className="fullscreen-menu__nav-item-wrapper">Waka Waka</span>
              </Link>
              <Link
                className="fullscreen-menu__nav-item"
                to={`${BASE}/furniture/chair-collection`}
                onClick={() => setMenuOpen(false)}
              >
                <span className="fullscreen-menu__nav-item-wrapper">Furniture</span>
              </Link>
              <Link
                className="fullscreen-menu__nav-item fullscreen-menu__nav-item-studio"
                to={`${BASE}/studio`}
                onClick={() => setMenuOpen(false)}
              >
                <span className="fullscreen-menu__nav-item-wrapper">Studio</span>
              </Link>
              <Link
                className="fullscreen-menu__nav-item fullscreen-menu__nav-item-index"
                to={`${BASE}/catalogue`}
                onClick={() => setMenuOpen(false)}
              >
                <span className="fullscreen-menu__nav-item-wrapper">Index</span>
              </Link>
            </nav>
            <div className="fullscreen-menu__logo">
              <WakaMark width={44} />
            </div>
          </div>
        </div>

        <div id="content">
          <Outlet />
        </div>

        <footer id="site-footer">
          <div className="site-footer__grid">
            <div className="site-footer__left">
              <span className="footer-dot" />
              <h3>{site.footerLeft}</h3>
            </div>
            <div className="site-footer__details">
              <span className="footer-dot" />
              <div className="site-footer__details-content">
                <h3>{site.location}</h3>
                <h3>{site.phone}</h3>
              </div>
            </div>
            <div className="site-footer__links">
              {site.links.map((l) => (
                <a key={l.linkUrl} href={l.linkUrl} target="_blank" rel="noopener noreferrer">
                  {l.linkLabel}
                </a>
              ))}
            </div>
            <div className="site-footer__copyright">
              <span className="footer-dot" />
              <h3>
                {site.copyrightLabel}
                <br />
                {site.copyrightYears}
              </h3>
            </div>
          </div>
        </footer>

        {/* Prod: .site .main-background — cream plane behind the 3D pull */}
        <span className="main-background" aria-hidden />
      </div>

      {/* Prod: siblings of .site — visible while site is transparent during intro */}
      <div className="logo-global" aria-hidden>
        <WakaMark width={44} />
      </div>
      <p className="label-global">{site.description}</p>
    </>
  );
}

export function WakaPage({
  id,
  className,
  children,
  pageRef,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
  pageRef?: Ref<HTMLElement>;
}) {
  return (
    <section id={id} ref={pageRef} className={`page-wrapper ${className ?? ''}`.trim()}>
      {children}
    </section>
  );
}

export { BASE as WAKA_BASE };
