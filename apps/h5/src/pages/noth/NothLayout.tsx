import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { NOTH_CHROME_HTML } from './generated/nothChrome.html';
import { useNothSiteRuntime } from './hooks/useNothSiteRuntime';
import {
  destroyNothChromeRuntime,
  runNothChromeRuntime,
  syncNothChromeForRoute,
} from './runtime/chromeRuntime';
import { NOTH_LEGACY_MAIN } from './runtime/config';
import { ensureNothStyleLinks } from './nothStyles';
import './styles/fonts.css';
import './styles/noth-runtime.css';
import './noth.css';

export default function NothLayout() {
  const rootRef = useRef<HTMLDivElement>(null);
  const chromeRef = useRef<HTMLDivElement>(null);
  const pageSlotRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const page = location.pathname.includes('/works') ? 'works' : 'home';

  useNothSiteRuntime(rootRef);

  useEffect(() => {
    if (!chromeRef.current) return;
    chromeRef.current.innerHTML = NOTH_CHROME_HTML;
    const root = rootRef.current;
    if (!NOTH_LEGACY_MAIN && root) runNothChromeRuntime(root);
    return () => {
      if (!NOTH_LEGACY_MAIN) destroyNothChromeRuntime();
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!NOTH_LEGACY_MAIN && root) syncNothChromeForRoute(root);
  }, [location.pathname]);

  useEffect(() => {
    ensureNothStyleLinks(page);
    document.title = page === 'works' ? "Nothin' | Works" : "Nothin' | Home";
  }, [page]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div ref={rootRef} className="noth-root">
      <div ref={chromeRef} className="noth-chrome" />
      <div ref={pageSlotRef} className="noth-page-slot" />
      <Outlet context={{ pageSlotRef, rootRef }} />
    </div>
  );
}
