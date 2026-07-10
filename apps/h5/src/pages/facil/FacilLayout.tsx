import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import FacilHeader from './components/FacilHeader';
import FacilFooter from './components/FacilFooter';
import FacilCookieBanner from './components/FacilCookieBanner';
import FacilInterfaceCanvas from './components/FacilInterfaceCanvas';
import FacilSidemenu from './components/FacilSidemenu';
import FacilIndexBar from './components/FacilIndexBar';
import { FacilNavProvider } from './context/FacilNavContext';
import { FacilLocaleProvider } from './context/FacilLocaleContext';
import { useFacilScroll } from './hooks/useFacilScroll';
import { useFacilCursor } from './hooks/useFacilCursor';
import { useFacilAnalytics } from './hooks/useFacilAnalytics';
import './facil.css';

export default function FacilLayout() {
  const rootRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useFacilScroll(rootRef);
  useFacilCursor();
  useFacilAnalytics();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.classList.add('facil-body', '__scroll-manual', '__cursor', 'palette-primary');
    document.documentElement.style.background = '#fff';
    document.body.style.background = '#fff';
    return () => {
      document.body.classList.remove('facil-body', '__scroll-manual', '__cursor', 'palette-primary');
      document.documentElement.style.background = '';
      document.body.style.background = '';
    };
  }, []);

  useEffect(() => {
    rootRef.current?.scrollTo(0, 0);
    window.scrollTo(0, 0);
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, [location.pathname]);

  return (
    <FacilLocaleProvider>
      <FacilNavProvider>
        <div ref={rootRef} className="facil-root">
          <FacilInterfaceCanvas />
          <FacilSidemenu />
          <FacilIndexBar />
          <FacilHeader />
          <main className="facil-main">
            <div className="wrap">
              <Outlet />
            </div>
          </main>
          <FacilFooter />
          <FacilCookieBanner />
        </div>
      </FacilNavProvider>
    </FacilLocaleProvider>
  );
}
