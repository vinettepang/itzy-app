import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFacilNav } from '../context/FacilNavContext';
import { useFacilLocale } from '../context/FacilLocaleContext';

export default function FacilIndexBar() {
  const { sidemenuOpen, openSidemenu } = useFacilNav();
  const { t, path } = useFacilLocale();
  const [progress, setProgress] = useState(0);

  const INDEX_ITEMS = [
    { to: path('people'), text: t('index.people') },
    { to: path('works'), text: t('index.works') },
    { to: path('philosophy'), text: t('index.philosophy') },
    { to: path('contact'), text: t('index.contact') },
  ];

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      id="IndexBar"
      className="facil-indexbar"
      aria-expanded={sidemenuOpen}
      role="menu"
      onClick={openSidemenu}
    >
      <div className="holder">
        <span className="IndexBar__bg" />
        <nav id="IndexBarNav" className="IndexBar__nav" role="navigation">
          <span className="fake" />
          {INDEX_ITEMS.map((item) => (
            <Link key={item.to} to={item.to} onClick={(e) => e.stopPropagation()}>
              <span className="text">{item.text}</span>
            </Link>
          ))}
        </nav>
        <div className="progress" style={{ transform: `scaleX(${progress})` }} />
      </div>
    </nav>
  );
}
