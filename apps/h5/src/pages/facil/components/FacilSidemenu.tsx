import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useFacilNav } from '../context/FacilNavContext';
import { useFacilLocale } from '../context/FacilLocaleContext';

export default function FacilSidemenu() {
  const { sidemenuOpen, closeSidemenu, toggleSidemenu } = useFacilNav();
  const { t, path, locale, switchLocalePath } = useFacilLocale();
  const location = useLocation();

  const NAV = [
    { to: path('people'), text: t('nav.people'), subtext: t('nav.peopleSub') },
    { to: path('works'), text: t('nav.works'), subtext: t('nav.worksSub') },
    { to: path('philosophy'), text: t('nav.philosophy'), subtext: t('nav.philosophySub') },
    { to: path('contact'), text: t('nav.contact'), subtext: t('nav.contactSub') },
  ];

  useEffect(() => {
    closeSidemenu();
  }, [location.pathname, closeSidemenu]);

  useEffect(() => {
    document.body.style.overflow = sidemenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidemenuOpen]);

  return (
    <>
      <button
        id="SidemenuClose"
        type="button"
        className={`facil-sidemenu-close${sidemenuOpen ? ' is-visible' : ''}`}
        aria-label="Close menu"
        onClick={toggleSidemenu}
      />
      <nav id="Sidemenu" className="facil-sidemenu" aria-expanded={sidemenuOpen} role="menu">
        <div className="holder">
          <span className="sidemenu__bg" />
          <div className="sidemenu__logo">
            <Link to={path()} className="logo" aria-label="Home" onClick={closeSidemenu}>
              <span className="facil-font">{t('brand')}</span>
            </Link>
          </div>
          <nav className="sidemenu__nav" role="navigation">
            {NAV.map((item) => (
              <Link key={item.to} to={item.to} className="nav-item" onClick={closeSidemenu}>
                <span className="text">{item.text}</span>
                <span className="subtext">{item.subtext}</span>
              </Link>
            ))}
          </nav>
          <div className="sidemenu__langs">
            <Link
              to={switchLocalePath('es')}
              className={locale === 'es' ? '--active' : ''}
              onClick={closeSidemenu}
            >
              {t('lang.es')}
            </Link>
            <Link
              to={switchLocalePath('en')}
              className={locale === 'en' ? '--active' : ''}
              onClick={closeSidemenu}
            >
              {t('lang.en')}
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}
