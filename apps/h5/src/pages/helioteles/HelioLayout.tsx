import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Outlet, useLocation, useSearchParams } from 'react-router-dom';
import CargoContent from './CargoContent';
import { HelioScrollCtx } from './HelioScroll';
import { HELIO_BASE, pageBackground, pageByPurl, slugToPurl } from './data';
import './helioteles.css';

export default function HelioLayout() {
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const [mobileIndex, setMobileIndex] = useState(params.get('index') === '1');
  const rootRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLElement>(null);

  useEffect(() => {
    document.title = 'DPoHT 2025';
    document.documentElement.classList.add('ht-html');
    document.body.classList.add('ht-body');
    return () => {
      document.documentElement.classList.remove('ht-html');
      document.body.classList.remove('ht-body');
      document.documentElement.style.removeProperty('--ht-page-bg');
    };
  }, []);

  useEffect(() => {
    setMobileIndex(params.get('index') === '1');
  }, [params]);

  useEffect(() => {
    window.scrollTo(0, 0);
    rightRef.current?.scrollTo(0, 0);
    if (params.get('index') === '1' && !location.search.includes('index=1')) {
      setMobileIndex(false);
    }
  }, [location.pathname, location.search, params]);

  useEffect(() => {
    const root = rootRef.current;
    const right = rightRef.current;
    if (!root || !right) return;

    const onWheel = (event: WheelEvent) => {
      if (right.contains(event.target as Node)) return;
      right.scrollTop += event.deltaY;
      event.preventDefault();
    };

    root.addEventListener('wheel', onWheel, { passive: false });
    return () => root.removeEventListener('wheel', onWheel);
  }, []);

  const header = pageByPurl('header');
  const headerMobile = pageByPurl('header-mobile');
  const isVariety = location.pathname.startsWith('/variety');
  const index = pageByPurl(isVariety ? 'index-variety' : 'index-desktop');
  const indexMobile = pageByPurl(isVariety ? 'index-variety' : 'index-mobile') || index;
  const basePath = location.pathname.startsWith(HELIO_BASE) ? HELIO_BASE : '/variety';
  const slug = location.pathname.slice(basePath.length).replace(/^\//, '') || undefined;
  const pageBg = pageBackground(pageByPurl(slugToPurl(slug)));

  useEffect(() => {
    document.documentElement.style.setProperty('--ht-page-bg', pageBg);
  }, [pageBg]);

  return (
    <HelioScrollCtx.Provider value={rightRef}>
      <div ref={rootRef} className="ht-root" style={{ '--ht-page-bg': pageBg } as CSSProperties}>
        <header className="ht-header ht-header--desktop">
          {header ? <CargoContent html={header.content} /> : null}
        </header>
        <header className="ht-header ht-header--mobile">
          {headerMobile ? <CargoContent html={headerMobile.content} /> : null}
        </header>

        <aside className="ht-left">
          {index ? <CargoContent html={index.content} /> : null}
        </aside>

        {mobileIndex ? (
          <div className="ht-mobile-index">
            <button
              type="button"
              className="ht-mobile-index__close"
              onClick={() => {
                setMobileIndex(false);
                params.delete('index');
                setParams(params, { replace: true });
              }}
            >
              Close
            </button>
            {indexMobile ? <CargoContent html={indexMobile.content} /> : null}
          </div>
        ) : null}

        <main ref={rightRef} className="ht-right">
          <div key={location.pathname} className="ht-page-fade">
            <Outlet />
          </div>
        </main>
      </div>
    </HelioScrollCtx.Provider>
  );
}
