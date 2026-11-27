import { useEffect, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FP_BASE, felixContent } from './data';
import { FelixLogo } from './FelixLogo';
import FelixNav from './FelixNav';
import FelixInfoPanel from './FelixInfoPanel';
import FelixHomeGradient from './FelixHomeGradient';
import { FelixLenisContext } from './FelixLenisContext';
import {
  FELIX_MIRROR_STYLES,
  ensureFelixMirrorStyleLinks,
  getFelixMirrorStyleHrefs,
} from './felixMirrorStyles';
import { useFelixLenis } from './useFelixLenis';
import './felixpeault.css';

function useFelixViewport() {
  useEffect(() => {
    const setVh = () => {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight}px`);
    };
    setVh();
    window.addEventListener('resize', setVh);
    return () => window.removeEventListener('resize', setVh);
  }, []);
}

export default function FelixLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const infoOpen = location.pathname === `${FP_BASE}/info`;

  const isHome =
    location.pathname === FP_BASE ||
    location.pathname === `${FP_BASE}/` ||
    location.pathname === `${FP_BASE}/info`;

  const isSeries = location.pathname.startsWith(`${FP_BASE}/series`);
  const isSeriesIndex = location.pathname === `${FP_BASE}/series`;
  const isSmallHeader = !isHome && !isSeriesIndex;

  const styleHrefs = useMemo(() => {
    const extra: string[] = [];
    if (isHome) extra.push(FELIX_MIRROR_STYLES.home);
    if (isSeries) extra.push(FELIX_MIRROR_STYLES.series);
    return getFelixMirrorStyleHrefs(extra);
  }, [isHome, isSeries]);

  useFelixViewport();

  const lenis = useFelixLenis({
    infinite: isSeries,
    paused: infoOpen,
    pathname: location.pathname,
  });

  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    const prev = meta?.getAttribute('content');
    meta?.setAttribute('content', '#F7EEEC');
    return () => {
      if (prev != null) meta?.setAttribute('content', prev);
    };
  }, []);

  useEffect(() => {
    document.title = felixContent.seo.title;
    const html = document.documentElement;
    const body = document.body;
    html.classList.add('fp-html', 'is-felixpeault');
    body.classList.add('fp-body');
    body.style.opacity = '1';
    return () => {
      html.classList.remove('fp-html', 'is-felixpeault');
      body.classList.remove('fp-body', 'site-pushed-left');
      body.style.removeProperty('opacity');
    };
  }, []);

  useEffect(() => {
    ensureFelixMirrorStyleLinks(styleHrefs);
  }, [styleHrefs]);

  useEffect(() => {
    document.body.classList.toggle('site-pushed-left', infoOpen);
  }, [infoOpen]);

  const closeInfo = () => {
    const from = (location.state as { from?: string } | null)?.from;
    navigate(from && from !== `${FP_BASE}/info` ? from : FP_BASE);
  };

  return (
    <>
      {isHome ? <FelixHomeGradient /> : null}
      <FelixLenisContext.Provider value={lenis}>
        <div className="fp-root">
          <FelixLogo
            blendDifference={isHome && !infoOpen}
            isSmall={isSmallHeader}
            hasBio={isSeriesIndex}
            bio={felixContent.shortBio}
          />
          <FelixNav blendDifference={isHome && !infoOpen} />
          <Outlet />
        </div>
      </FelixLenisContext.Provider>
      {infoOpen ? (
        <div className="info-backdrop" role="presentation" onClick={closeInfo} />
      ) : null}
      <div className={`info-overlay${infoOpen ? ' is-open' : ''}`} data-lenis-prevent="">
        {infoOpen ? <FelixInfoPanel onClose={closeInfo} /> : null}
      </div>
    </>
  );
}
