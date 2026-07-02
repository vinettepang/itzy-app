import { Link, Outlet, useLocation } from 'react-router-dom';
import './AppLayout.css';

function NavLinkLike({
  to,
  label,
}: {
  to: string;
  label: string;
}) {
  const loc = useLocation();
  const active = loc.pathname === to || (to !== '/' && loc.pathname.startsWith(to));
  return (
    <Link
      className="h5-link"
      to={to}
      style={
        active
          ? {
              color: '#0b0b12',
              background: 'linear-gradient(120deg, #ff6aa8, #ffcc6a)',
              borderColor: 'transparent',
            }
          : undefined
      }
    >
      {label}
    </Link>
  );
}

export default function AppLayout() {
  return (
    <div className="h5-shell">
      <header className="h5-nav">
        <div className="h5-brand">ITZY · H5</div>
        <nav className="h5-links" aria-label="Primary">
          <NavLinkLike to="/" label="首页" />
          <NavLinkLike to="/schedules" label="行程" />
          <NavLinkLike to="/poster" label="海报" />
          <NavLinkLike to="/lab-style" label="LAB" />
          <NavLinkLike to="/virgil" label="Virgil" />
          <NavLinkLike to="/portfolio" label="Portfolio" />
          <NavLinkLike to="/xkm" label="XKM" />
          <NavLinkLike to="/songs" label="Songs" />
          <NavLinkLike to="/unseen" label="Unseen" />
          <NavLinkLike to="/balls" label="Balls" />
        </nav>
      </header>
      <main className="h5-main">
        <Outlet />
      </main>
    </div>
  );
}

