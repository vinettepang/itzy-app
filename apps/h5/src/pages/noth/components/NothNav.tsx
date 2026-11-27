import { Link, useLocation } from 'react-router-dom';
import { NOTH_ROUTES } from '../paths';

const LINKS = [
  { to: NOTH_ROUTES.works, label: 'Works' },
  { to: NOTH_ROUTES.studio, label: 'Studio' },
  { to: NOTH_ROUTES.contact, label: 'Contact' },
] as const;

export function NothNav() {
  const { pathname } = useLocation();
  const onHome = pathname === NOTH_ROUTES.home || pathname === `${NOTH_ROUTES.home}/`;

  return (
    <nav className="nav-boiler" data-reveal-init="1">
      <Link
        to={NOTH_ROUTES.home}
        className={`nav-logo-wrap w-inline-block${onHome ? ' w--current' : ''}`}
        aria-current={onHome ? 'page' : undefined}
      >
        <img src="/noth/assets/cf3378fe8b58-logo-nothin.svg" alt="Nothin'" className="nav-logo-img" />
      </Link>
      <div className="nav-links-w">
        {LINKS.map((item) => (
          <Link key={item.to} to={item.to} className="link nav">
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
