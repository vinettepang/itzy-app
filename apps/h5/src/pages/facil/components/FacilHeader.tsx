import { Link, NavLink } from 'react-router-dom';
import { useFacilNav } from '../context/FacilNavContext';
import { useFacilLocale } from '../context/FacilLocaleContext';

export default function FacilHeader() {
  const { openSidemenu } = useFacilNav();
  const { t, path } = useFacilLocale();

  const NAV = [
    { to: path('works'), label: t('nav.works') },
    { to: path('philosophy'), label: t('nav.philosophy') },
    { to: path('people'), label: t('nav.people') },
    { to: path('contact'), label: t('nav.contact') },
  ];

  return (
    <header id="Header" className="facil-header">
      <nav>
        <Link to={path()} className="facil-font">
          {t('brand')}
        </Link>
        <button
          type="button"
          className="facil-header__menu-toggle"
          aria-label="Open menu"
          onClick={openSidemenu}
        >
          <span />
          <span />
        </button>
        {NAV.map((item) => (
          <NavLink key={item.to} to={item.to} className="link-arrow facil-header__nav-link">
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
