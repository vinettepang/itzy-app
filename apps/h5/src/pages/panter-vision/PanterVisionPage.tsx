import { useCallback, useEffect, useState } from 'react';
import { PanterVisionHero } from '@/components/uicoms';
import type { PosterDrawOptions } from '@/components/uicoms';
import PanterVisionNav from './PanterVisionNav';
import '@/pages/nav/nav.css';
import './panter-vision-page.css';

const ITZY_POSTER: Partial<PosterDrawOptions> = {
  metaLeft: 'ITZY\n@ITZYofficial',
  metaCenter: 'All In Us\nTour',
  metaRight: 'World Tour\n2025',
  headlineTop: 'TUNNEL',
  headlineBottom: 'VISION',
  taglineSolid: 'ITZY',
  taglineOutline: 'ALL IN US',
  body:
    'Yeji, Lia, Ryujin, Chaeryeong, and Yuna step into the same tunnel of sound — LOCO, WANNABE, GOLD, and every fanchant in between. Sync your light, match the beat, and let the floor answer back.',
};

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="panter-vision-page__menu-icon">
      {open ? (
        <path
          d="M6 6l12 12M18 6 6 18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ) : (
        <>
          <path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

export default function PanterVisionPage() {
  const [navOpen, setNavOpen] = useState(false);
  const [navClosing, setNavClosing] = useState(false);

  const toggleNav = useCallback(() => {
    if (navOpen) {
      setNavClosing(true);
      setNavOpen(false);
      return;
    }
    setNavClosing(false);
    setNavOpen(true);
  }, [navOpen]);

  const onNavShellTransitionEnd = useCallback(() => {
    if (!navOpen) setNavClosing(false);
  }, [navOpen]);

  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setNavClosing(true);
        setNavOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navOpen]);
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlBg = html.style.background;
    const prevBodyBg = body.style.background;

    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    html.style.background = '#000';
    body.style.background = '#000';

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      html.style.background = prevHtmlBg;
      body.style.background = prevBodyBg;
    };
  }, []);

  return (
    <main className="panter-vision-page">
      <PanterVisionHero
        className="panter-vision-page__hero"
        dprCap={1.75}
        motion="together"
        poster={ITZY_POSTER}
        posterContentWidthRatio={0.75}
        title="ITZY Tunnel Vision glass poster"
        scenePaused={navOpen || navClosing}
      />
      <button
        type="button"
        className="panter-vision-page__menu-toggle"
        aria-label={navOpen ? '关闭菜单' : '打开菜单'}
        aria-expanded={navOpen}
        aria-controls="panter-vision-nav"
        onClick={toggleNav}
      >
        <MenuIcon open={navOpen} />
      </button>
      <PanterVisionNav open={navOpen} onShellTransitionEnd={onNavShellTransitionEnd} />
    </main>
  );
}