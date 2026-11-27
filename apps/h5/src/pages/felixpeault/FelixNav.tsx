import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { FP_BASE } from './data';

const LINKS = [
  { to: `${FP_BASE}/series`, label: 'Series', sectionKey: 'series' as const },
  { to: `${FP_BASE}/journeys`, label: 'Elsewhere', sectionKey: 'journeys' as const },
  { to: `${FP_BASE}/info`, label: 'Info', sectionKey: null },
] as const;

type Props = {
  blendDifference?: boolean;
};

export default function FelixNav({ blendDifference }: Props) {
  const location = useLocation();
  const [linksOpen, setLinksOpen] = useState(false);

  const seriesIndexPath = `${FP_BASE}/series`;
  const journeysPath = `${FP_BASE}/journeys`;
  const isSeriesIndex = location.pathname === seriesIndexPath;
  const isJourneys = location.pathname === journeysPath;
  const sectionKey = isSeriesIndex ? 'series' : isJourneys ? 'journeys' : null;
  const sectionMode = sectionKey != null && !linksOpen;
  const sectionLabel = sectionKey === 'series' ? 'Series' : 'Elsewhere';

  return (
    <nav
      className={`nav svelte-vwfk65${blendDifference ? ' is-difference' : ''}`}
      aria-label="Primary"
      onPointerMove={() => setLinksOpen(true)}
      onMouseLeave={() => sectionKey && setLinksOpen(false)}
    >
      {sectionMode ? (
        <div className="button button-section svelte-vwfk65">
          <Link
            className="svelte-vwfk65"
            to={sectionKey === 'series' ? seriesIndexPath : journeysPath}
            onPointerEnter={() => setLinksOpen(true)}
          >
            {sectionLabel}
          </Link>
        </div>
      ) : (
        <ul className="svelte-vwfk65">
          {LINKS.map((item, i) => (
            <li key={item.to} className="link title-small svelte-vwfk65" style={{ ['--i' as string]: i }}>
              <NavLink
                to={item.to}
                state={item.to.endsWith('/info') ? { from: location.pathname } : undefined}
                className={({ isActive }) =>
                  `svelte-vwfk65${isActive ? ' is-active' : ''}`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
