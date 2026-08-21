import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import site from './data/site.json';
import StagecrewLogo from './StagecrewLogo';
import './stagecrew.css';

export const SC_BASE = '/stagecrew';

const NAV = [
  { to: SC_BASE, label: 'Work', end: true },
  { to: `${SC_BASE}/info`, label: 'Info' },
  { to: `${SC_BASE}/backstage`, label: 'Backstage' },
];

export default function StagecrewLayout() {
  const location = useLocation();
  const rootRef = useRef<HTMLDivElement>(null);
  const isWorkIndex =
    location.pathname === SC_BASE || location.pathname === `${SC_BASE}/`;

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    html.classList.add('is-stagecrew', 'lenis');
    body.classList.add('sc-body');
    return () => {
      html.classList.remove('is-stagecrew', 'lenis', 'lenis-smooth');
      body.classList.remove('sc-body');
    };
  }, []);

  useEffect(() => {
    // Work index owns its own vertical drag/wheel; disable Lenis there (SOURCE: no page footer/scroll)
    if (isWorkIndex) {
      document.documentElement.classList.remove('lenis-smooth');
      return;
    }
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.12,
    });
    document.documentElement.classList.add('lenis-smooth');
    return () => {
      lenis.destroy();
      document.documentElement.classList.remove('lenis-smooth');
    };
  }, [isWorkIndex]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className={`sc-root${isWorkIndex ? ' sc-root--work' : ''}`} ref={rootRef}>
      <header className="sc-header">
        <div className="sc-header__inner">
          <Link to={SC_BASE} className="sc-logo group" title="StageCrew Logo">
            <StagecrewLogo />
          </Link>
          <nav className="sc-nav" aria-label="Primary">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `sc-nav__link${isActive ? ' is-active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
            {site.header.externalLinks.map((l) => (
              <a
                key={l.url}
                className="sc-nav__link"
                href={l.url}
                target={l.url.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="sc-main">
        <Outlet />
      </main>

      {!isWorkIndex ? (
        <footer className="sc-footer">
          <div className="sc-footer__grid">
            <div className="sc-footer__blurb" dangerouslySetInnerHTML={{ __html: site.footer.text }} />
            <div className="sc-footer__contact" dangerouslySetInnerHTML={{ __html: site.footer.contactInfo }} />
            <p className="sc-footer__disclaimer">{site.footer.disclaimer}</p>
            <div className="sc-footer__marks">
              {site.footer.bottomLabels.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
          </div>
        </footer>
      ) : null}
    </div>
  );
}
