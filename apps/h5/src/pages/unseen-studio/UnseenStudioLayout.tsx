import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { studioSound } from './audio/studioSound';
import { NAV, TAGLINE, UNSEEN_FONT_CSS } from './assetPaths';
import eyesUrl from './assets/loader-eyes.svg';
import HomeCanvas from './components/HomeCanvas';
import RouteTransition from './components/RouteTransition';
import StudioAudio from './components/StudioAudio';
import type { SceneMode } from './scene/createHomeScene';
import './unseen-studio.css';

type Phase = 'loading' | 'ready' | 'entered';

function pathToMode(pathname: string): SceneMode {
  if (pathname.includes('/contact')) return 'contact';
  if (pathname.includes('/projects')) return 'projects';
  if (pathname.includes('/world')) return 'world';
  return 'home';
}

export type UnseenOutletCtx = {
  tagline: string;
  phaseEntered: boolean;
};

export default function UnseenStudioLayout() {
  const location = useLocation();
  const mode = useMemo(() => pathToMode(location.pathname), [location.pathname]);
  const [phase, setPhase] = useState<Phase>('loading');
  const [progress, setProgress] = useState(0);
  const [sceneReady, setSceneReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [wantAudio, setWantAudio] = useState(false);
  const [muted, setMuted] = useState(true);
  const showHomeCanvas = mode === 'home' || mode === 'contact';

  useEffect(() => {
    const style = document.createElement('style');
    style.setAttribute('data-unseen-studio-fonts', 'true');
    style.textContent = UNSEEN_FONT_CSS;
    document.head.appendChild(style);

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.background = '#212121';

    return () => {
      style.remove();
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.background = '';
    };
  }, []);

  const prevPath = useRef(location.pathname);

  useEffect(() => {
    setMenuOpen(false);
    const to = pathToMode(location.pathname);
    const from = pathToMode(prevPath.current);
    prevPath.current = location.pathname;
    if (phase === 'entered' && from !== to) {
      studioSound.playRoute(to === 'projects' || to === 'contact' || to === 'world' ? to : 'home');
    }
  }, [location.pathname, phase]);

  useEffect(() => {
    if (sceneReady && phase === 'loading') setPhase('ready');
  }, [sceneReady, phase]);

  const onSceneProgress = useCallback((pct: number) => {
    setProgress((prev) => Math.max(prev, pct));
  }, []);

  const onSceneReady = useCallback(() => {
    setProgress(100);
    setSceneReady(true);
  }, []);

  const onSceneError = useCallback((err: Error) => {
    console.error('[unseen-studio] WebGL load failed', err);
    setProgress(100);
    setSceneReady(true);
  }, []);

  const enter = (withAudio: boolean) => {
    setWantAudio(withAudio);
    setMuted(!withAudio);
    setPhase('entered');
    if (withAudio) {
      studioSound.setMuted(false);
      studioSound.setEnabled(true);
      studioSound.play('click');
    }
    // ProjectMenuCanvas may have booted while loader was up — notify WebGL shells
    queueMicrotask(() => window.dispatchEvent(new CustomEvent('us-studio-entered')));
  };

  const toggleMenu = () => {
    setMenuOpen((v) => {
      const next = !v;
      if (phase === 'entered') studioSound.play(next ? 'menu_swoosh' : 'menu_close');
      return next;
    });
  };

  return (
    <div
      className={`unseen-studio unseen-studio--${mode}${phase === 'entered' ? ' is-entered' : ''}`}
      data-audio={wantAudio && !muted ? 'on' : 'off'}
      data-mode={mode}
    >
      <Loader
        progress={progress}
        ready={phase !== 'loading'}
        done={phase === 'entered'}
        onEnterAudio={() => enter(true)}
        onEnterSilent={() => enter(false)}
      />

      <StudioAudio enabled={phase === 'entered' && wantAudio} muted={muted} />
      <RouteTransition />

      <div className={`us-shell${phase === 'entered' ? ' is-active' : ''}`}>
        <div className={`us-canvas-wrap${showHomeCanvas ? '' : ' is-hidden'}`} aria-hidden={!showHomeCanvas}>
          <HomeCanvas
            active={phase === 'entered' && showHomeCanvas}
            mode={mode === 'projects' || mode === 'world' ? 'home' : mode}
            onProgress={onSceneProgress}
            onReady={onSceneReady}
            onError={onSceneError}
          />
        </div>

        <header className="us-header">
          <Link to="/unseen-studio" className="us-wordmark" title="Unseen Studio Home">
            unseen studio
          </Link>
          <div className="us-header__right">
            <nav className="us-nav" aria-label="Primary">
              {NAV.slice(0, 3).map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/unseen-studio'}
                  onMouseEnter={() => phase === 'entered' && studioSound.playHover()}
                  onClick={() => phase === 'entered' && studioSound.play('click')}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            {phase === 'entered' && wantAudio && (
              <button
                type="button"
                className="us-sound-toggle"
                aria-label={muted ? 'Unmute sound' : 'Mute sound'}
                onClick={() => setMuted((v) => !v)}
              >
                {muted ? 'Sound off' : 'Sound on'}
              </button>
            )}
            <button
              type="button"
              className="us-menu-toggle"
              aria-label="Toggle Menu"
              aria-expanded={menuOpen}
              onClick={toggleMenu}
            >
              <span className="us-menu-toggle-inner">
                <span />
                <span />
              </span>
            </button>
          </div>
        </header>

        <div className={`us-menu${menuOpen ? ' is-open' : ''}`} role="dialog" aria-label="Site menu">
          <div>
            <ul className="us-menu__list">
              {NAV.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onMouseEnter={() => studioSound.playHover()}
                    onClick={() => {
                      studioSound.play('click');
                      setMenuOpen(false);
                    }}
                  >
                    <span className="us-menu__n">{item.n}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="us-menu__meta">
              <a href="mailto:projects@unseen.co">projects@unseen.co</a>
              <a href="tel:+4401179226892">(+44) 0117 922 6892</a>
              <a href="https://twitter.com/uns__nstudio" target="_blank" rel="noreferrer">
                Twitter
              </a>
              <a href="https://www.instagram.com/uns__nstudio/" target="_blank" rel="noreferrer">
                Instagram
              </a>
              <a href="https://www.linkedin.com/company/un-seen-studio" target="_blank" rel="noreferrer">
                LinkedIn
              </a>
              <a href="https://dribbble.com/unseenstudio" target="_blank" rel="noreferrer">
                Dribbble
              </a>
              <a href="https://www.behance.net/unseen-studio" target="_blank" rel="noreferrer">
                Behance
              </a>
            </div>
          </div>
        </div>

        <div className="us-footer-cta">
          <a href="https://2025.unseen.co/" target="_blank" rel="noreferrer" title="Our 2025 Wrapped">
            Our 2025 Wrapped
          </a>
        </div>

        <Outlet
          context={
            {
              tagline: TAGLINE,
              phaseEntered: phase === 'entered',
            } satisfies UnseenOutletCtx
          }
        />
      </div>
    </div>
  );
}

function Loader({
  progress,
  ready,
  done,
  onEnterAudio,
  onEnterSilent,
}: {
  progress: number;
  ready: boolean;
  done: boolean;
  onEnterAudio: () => void;
  onEnterSilent: () => void;
}) {
  return (
    <div
      className={`us-loader${done ? ' is-done' : ''}`}
      style={{ ['--us-progress' as string]: `${progress}%` }}
      aria-hidden={done}
    >
      <div className="us-loader__progress" aria-hidden>
        <div className="us-loader__progress-inner">
          <div className="us-loader__inner">
            <img className="us-loader__eyes" src={eyesUrl} alt="" />
            <Letters pink />
            <span className="us-loader__title" style={{ color: '#212121' }}>
              Unseen Studio®
            </span>
            <p className="us-loader__tagline" style={{ color: '#212121' }}>
              A brand, digital and motion studio creating
              <br />
              refreshingly unexpected ideas and striking visuals
              <br />
              that help bold brands cut through the noise.
            </p>
          </div>
        </div>
      </div>

      <div className="us-loader__inner">
        <Letters />
        <span className="us-loader__title">Unseen Studio®</span>
        <p className="us-loader__tagline">
          A brand, digital and motion studio creating
          <br />
          refreshingly unexpected ideas and striking visuals
          <br />
          that help bold brands cut through the noise.
        </p>
      </div>

      <div className="us-loader__actions">
        <button type="button" className="us-btn" disabled={!ready} onClick={onEnterAudio}>
          Enter
        </button>
        <button type="button" className="us-btn us-btn--ghost" disabled={!ready} onClick={onEnterSilent}>
          Enter without audio
        </button>
      </div>
    </div>
  );
}

function Letters({ pink = false }: { pink?: boolean }) {
  return (
    <div className={`us-loader__letters${pink ? ' us-loader__letters--pink' : ''}`} aria-hidden>
      {'UNSEEN'.split('').map((ch, i) => (
        <div key={`${ch}-${i}`}>{ch}</div>
      ))}
    </div>
  );
}

export function UnseenStudioPage({
  title,
  variant = 'default',
  children,
}: {
  title: string;
  variant?: 'default' | 'home' | 'projects' | 'contact' | 'world';
  children?: ReactNode;
}) {
  const home = title === 'Home' || variant === 'home';
  return (
    <main
      className={`us-page${home ? ' us-page--home' : ''} us-page--${variant}`}
      role="main"
      data-router-view={variant}
    >
      <h1>{home || variant === 'projects' || variant === 'world' ? <span className="us-sr">{title}</span> : title}</h1>
      {children}
    </main>
  );
}
