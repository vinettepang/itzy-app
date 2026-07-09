import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import RefractionCanvas from './components/RefractionCanvas';
import UiDecor from './components/UiDecor';
import type { RefractionSceneHandle } from './scene/types';
import './webgl-refraction.css';

export default function WebglRefractionPage() {
  const [loading, setLoading] = useState(true);
  const [cursorText, setCursorText] = useState('CLICK + HOLD');
  const handleRef = useRef<RefractionSceneHandle | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const loadCompleteRef = useRef(false);

  useEffect(() => {
    const setScreenHeight = () => {
      document.documentElement.style.setProperty('--screen-height', `${window.innerHeight}px`);
    };
    setScreenHeight();

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.background = '#e4e4e4';
    document.body.style.background = '#e4e4e4';
    document.body.classList.add('light-theme');

    const onResize = () => setScreenHeight();
    const onMove = (e: PointerEvent) => {
      const el = cursorRef.current;
      if (!el) return;
      el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', onMove);

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.style.removeProperty('--screen-height');
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.documentElement.style.background = '';
      document.body.style.background = '';
      document.body.classList.remove('light-theme', 'dark-theme');
    };
  }, []);

  const hideLoader = () => {
    const el = loaderRef.current;
    if (!el) return;
    gsap.to(el, {
      opacity: 0,
      duration: 0.6,
      ease: 'power2.inOut',
      onComplete: () => setLoading(false),
    });
  };

  const onSceneReady = useCallback((handle: RefractionSceneHandle) => {
    handleRef.current = handle;
    if (loadCompleteRef.current) hideLoader();
  }, []);

  const onProgress = useCallback((pct: number) => {
    const el = loaderRef.current;
    if (el) {
      el.style.setProperty('--mask-progress', `${-100 + pct}%`);
      el.style.setProperty('--loader-progress', `${100 - pct}%`);
    }
    if (pct >= 100) {
      loadCompleteRef.current = true;
      if (handleRef.current) hideLoader();
    }
  }, []);

  const onSceneError = useCallback(() => {
    loadCompleteRef.current = true;
    hideLoader();
  }, []);

  const onThemeChange = useCallback((index: 1 | 2) => {
    document.body.classList.toggle('light-theme', index === 1);
    document.body.classList.toggle('dark-theme', index === 2);
    animateSceneText(index);
  }, []);

  const animateSceneText = (index: 1 | 2) => {
    if (index === 2) {
      gsap.timeline({ defaults: { ease: 'expo.inOut', duration: 0.45 } })
        .to('.js-title-1', { yPercent: -100, opacity: 0 })
        .to('.js-subtitle-1', { yPercent: 100, opacity: 0 }, 0)
        .from('.js-title-2 span', { xPercent: -10, opacity: 0, stagger: 0.01 }, 0)
        .from('.js-subtitle-2 span', { xPercent: 10, opacity: 0, stagger: 0.02 }, 0);
    } else {
      gsap.timeline({ defaults: { ease: 'expo.inOut', duration: 0.45 } })
        .to('.js-title-2 span', { xPercent: -10, opacity: 0, stagger: 0.01 })
        .to('.js-subtitle-2 span', { xPercent: 10, opacity: 0, stagger: 0.02 }, 0)
        .to('.js-title-1', { yPercent: 0, opacity: 1 })
        .to('.js-subtitle-1', { yPercent: 0, opacity: 1 }, 0);
    }
  };

  const onHoldChange = useCallback((holding: boolean) => {
    setCursorText(holding ? '' : 'CLICK + HOLD');
    if (holding) {
      gsap.to('.js-title-1 > div', { yPercent: -100, opacity: 0, duration: 0.45, ease: 'expo.inOut' });
      gsap.to('.js-subtitle-1', { yPercent: 100, opacity: 0, duration: 0.45, ease: 'expo.inOut' });
    }
  }, []);

  const switchDemo = (index: 1 | 2) => {
    if (index === 1) handleRef.current?.switchToScene1();
    else handleRef.current?.switchToScene2();
    document.querySelectorAll('.js-nav-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-btn') === String(index - 1));
    });
  };

  return (
    <div className="webgl-refraction">
      {loading ? (
        <div ref={loaderRef} className="loader js-loader">
          <div className="loader__inner js-loader-inner">
            <div className="loader__logo">
              <p className="t-sans-serif t-uppercase" style={{ textAlign: 'center', opacity: 0.4 }}>
                unseen LABS
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <div ref={cursorRef} className="cursor js-cursor">
        <div className="cursor__circle" />
        <div className="cursor__text t-uppercase t-sans-serif js-cursor-text">{cursorText}</div>
      </div>

      <RefractionCanvas
        onReady={onSceneReady}
        onProgress={onProgress}
        onError={onSceneError}
        onThemeChange={onThemeChange}
        onHoldChange={onHoldChange}
      />

      <div className="scene-text scene-text--1">
        <div className="title js-title js-title-1">
          <div>
            <div><span className="t-uppercase t-serif">Creating</span></div>
            <div><span className="t-display left-padding">the</span></div>
            <div><span className="t-uppercase t-serif">Unexpected</span></div>
          </div>
        </div>
        <div className="subtitle js-subtitle js-subtitle-1">
          <div>
            <span className="t-uppercase t-serif">An</span>
            <span className="t-sans-serif t-uppercase">Unseen Labs™</span>
            <span className="t-uppercase t-serif">Experiment</span>
          </div>
          <a className="twitter-link hide-cursor" href="https://twitter.com/uns__nstudio" target="_blank" rel="noreferrer">
            <p className="t-sans-serif t-uppercase t-ls-2">@UNS__NSTUDIO</p>
          </a>
        </div>
      </div>

      <div className="scene-text scene-text--2">
        <div className="title js-title js-title-2">
          <div>
            <span className="t-uppercase t-serif t-ls-8">Creating</span>
            <span className="t-display top-padding">the</span>
            <span className="t-uppercase t-serif t-ls-8">Unexpected</span>
          </div>
        </div>
        <div className="subtitle js-subtitle js-subtitle-2">
          <div>
            <span className="t-uppercase t-serif">An</span>
            <span className="t-sans-serif t-uppercase">Unseen Labs™</span>
            <span className="t-uppercase t-serif">Experiment</span>
          </div>
        </div>
      </div>

      <div className="height-div" aria-hidden="true" />

      <div className="ui">
        <UiDecor />

        <div className="corner corner--top-left">
          <div className="nav nav--header">
            <div className="nav__text t-serif t-uppercase t-small"><span className="d-block">Demo</span></div>
            <button type="button" data-btn="0" className="nav__btn hide-cursor js-scene-1 js-nav-btn active" onClick={() => switchDemo(1)}>01</button>
            <button type="button" data-btn="1" className="nav__btn hide-cursor js-scene-2 js-nav-btn" onClick={() => switchDemo(2)}>02</button>
          </div>
          <div className="corner__text d-flex">
            <div className="t-base t-uppercase t-sans-serif t-ls-3">Concept</div>
            <p className="t-base t-uppercase t-ls-3">
              blending graphical treatments <br />
              with refractive materials
            </p>
          </div>
          <div className="credit credit--header">
            <p className="t-small t-sans-serif t-uppercase t-ls-2 t-grey">Created By</p>
            <a href="https://twitter.com/_elliegillespie" target="_blank" rel="noreferrer">
              <p className="t-small t-serif t-uppercase t-ls-2">Ellie Gillespie</p>
            </a>
          </div>
        </div>

        <div className="mobile-prompt t-small">
          <p className="t-sans-serif t-grey">TOUCH &amp; HOLD FOR MORE</p>
        </div>

        <div className="corner corner--bottom-left">
          <div className="info">
            <p className="t-mid t-uppercase">
              <span className="t-sans-serif">Unseen labs</span> represents the creative <br />
              experimentation arm of unseen studio. <br />
              it exists to give our team members an outlet <br />
              for explorative, self initiated projects.
            </p>
          </div>
          <div className="nav nav--footer">
            <div className="nav__text t-serif t-uppercase t-small"><span className="d-block">Demo</span></div>
            <button type="button" data-btn="0" className="nav__btn js-scene-1 js-nav-btn active" onClick={() => switchDemo(1)}>01</button>
            <button type="button" data-btn="1" className="nav__btn js-scene-2 js-nav-btn" onClick={() => switchDemo(2)}>02</button>
          </div>
        </div>

        <div className="corner corner--bottom">
          <div className="credit credit--footer">
            <p className="t-small t-sans-serif t-uppercase t-ls-2 t-grey">Created By</p>
            <a href="https://twitter.com/_elliegillespie" className="hide-cursor" target="_blank" rel="noreferrer">
              <p className="t-small t-serif t-uppercase t-ls-2">Ellie Gillespie</p>
            </a>
          </div>
        </div>

        <div className="corner corner--bottom-right">
          <div>
            <p className="t-small t-sans-serif t-uppercase t-ls-2">Experiment 002</p>
            <a className="default-link hide-cursor" href="https://unseen.co/" target="_blank" rel="noreferrer">
              <p className="t-small t-serif t-uppercase t-ls-2">Unseen Studio</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
