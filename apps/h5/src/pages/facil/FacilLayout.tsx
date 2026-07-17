import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import FacilHeader from './components/FacilHeader';
import FacilFooter from './components/FacilFooter';
import FacilCookieBanner from './components/FacilCookieBanner';
import FacilInterfaceCanvas from './components/FacilInterfaceCanvas';
import FacilSidemenu from './components/FacilSidemenu';
import FacilIndexBar from './components/FacilIndexBar';
import FacilPageTransition from './components/FacilPageTransition';
import { FacilNavProvider } from './context/FacilNavContext';
import { FacilLocaleProvider } from './context/FacilLocaleContext';
import { useFacilScroll } from './hooks/useFacilScroll';
import { useFacilCursor } from './hooks/useFacilCursor';
import { useFacilAnalytics } from './hooks/useFacilAnalytics';
import './facil.css';

export default function FacilLayout() {
  const rootRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useFacilScroll(rootRef, location.pathname);
  useFacilCursor();
  useFacilAnalytics();

  useEffect(() => {
    document.body.classList.add('facil-body', '__scroll-manual', '__cursor', 'palette-primary');
    document.documentElement.style.background = '#fff';
    document.body.style.background = '#fff';
    return () => {
      document.body.classList.remove('facil-body', '__scroll-manual', '__cursor', 'palette-primary');
      document.documentElement.style.background = '';
      document.body.style.background = '';
    };
  }, []);

  return (
    <FacilLocaleProvider>
      <FacilNavProvider>
        <div ref={rootRef} className="facil-root">
          <FacilInterfaceCanvas />
          <FacilSidemenu />
          <FacilIndexBar />
          <FacilHeader />
          <main className="facil-main" id="Main">
            <FacilPageTransition />
          </main>
          <FacilFooter />
          <FacilCookieBanner />
        </div>
      </FacilNavProvider>
    </FacilLocaleProvider>
  );
}
