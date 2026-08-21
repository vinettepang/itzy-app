import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import featured from '../data/featuredChairs.json';
import WakaMark from '../WakaMark';
import { WAKA_BASE, WakaPage } from '../WakaLayout';

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Prod ease aliases: cubic.out → power2.out, quart.out → power3.out */
const EASE_CUBIC_OUT = 'power2.out';
const EASE_QUART_OUT = 'power3.out';

function waitForImages(imgs: HTMLImageElement[]) {
  return Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }
          const done = () => {
            img.removeEventListener('load', done);
            img.removeEventListener('error', done);
            resolve();
          };
          img.addEventListener('load', done);
          img.addEventListener('error', done);
        }),
    ),
  );
}

/**
 * Homepage intro — 1:1 from prod Homepage.18a30190782f06d8a84f.js
 *
 * calculateZ → showComponent(TL.show) → onShown(+500ms) → showPoster →
 * onFirstShownComplete → gsap.to(site,{z:0, delay:1.5})
 */
export default function WakaHomePage() {
  const [chairIndex] = useState(() => randInt(0, Math.max(featured.length - 1, 0)));
  const [layout] = useState(() => randInt(0, 2));
  const rootRef = useRef<HTMLElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const creditRef = useRef<HTMLAnchorElement | null>(null);
  const logoRef = useRef<HTMLDivElement | null>(null);

  const chair = featured[chairIndex] ?? featured[0];
  const showSide = layout !== 0;

  useLayoutEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById('root');
    const page = rootRef.current;
    const wrapper = wrapperRef.current;
    const grid = gridRef.current;
    const site = document.querySelector('.waka-app.site') as HTMLElement | null;
    const credit = creditRef.current;
    const logo = logoRef.current;
    const footer = document.querySelector('#site-footer') as HTMLElement | null;
    const mainBg = document.querySelector('.site > .main-background') as HTMLElement | null;
    const labelGlobal = document.querySelector('.label-global') as HTMLElement | null;
    const logoGlobal = document.querySelector('.logo-global') as HTMLElement | null;

    html.classList.add('is-intro');
    html.classList.remove('is-intro-done');

    const finish = () => {
      html.classList.remove('is-intro');
      html.classList.add('is-intro-done');
      html.style.overflow = '';
      html.style.pointerEvents = '';
      body.style.overflow = '';
      body.style.perspective = '';
      body.style.perspectiveOrigin = '';
      body.style.height = '';
      if (root) {
        root.style.transformStyle = '';
        root.style.height = '';
      }
      if (site) {
        site.style.background = '';
        site.style.overflow = '';
      }
      if (mainBg) mainBg.style.display = '';
      if (labelGlobal) labelGlobal.style.display = '';
      if (logoGlobal) logoGlobal.style.display = '';
    };

    if (!page || !wrapper || !grid || !site || !mainBg) {
      finish();
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finish();
      return;
    }

    let cancelled = false;
    let playDelay = 0;
    let completed = false;
    const tweens: gsap.core.Animation[] = [];

    const complete = () => {
      if (completed || cancelled) return;
      completed = true;
      finish();
      gsap.set([site, wrapper, grid, mainBg, page, credit, logo, footer].filter(Boolean), {
        clearProps: 'all',
      });
    };

    // ——— calculateZ (prod) ———
    html.style.overflow = 'hidden';
    html.style.pointerEvents = 'none';
    body.style.overflow = 'hidden';
    body.style.perspective = '2000px';
    body.style.perspectiveOrigin = '50% 0%';
    body.style.height = '100%';
    // React: body > #root > .site — preserve-3d so body perspective reaches .site
    if (root) {
      root.style.transformStyle = 'preserve-3d';
      root.style.height = '100%';
    }
    site.style.background = 'transparent';
    site.style.overflow = 'hidden';
    mainBg.style.display = 'block';
    if (labelGlobal) labelGlobal.style.display = 'block';
    if (logoGlobal) logoGlobal.style.display = 'block';

    gsap.set([footer, credit, logo].filter(Boolean), { opacity: 0, willChange: 'opacity' });
    gsap.set(page, { autoAlpha: 0 });

    // Prod measures natural site.offsetHeight (no viewport lock)
    const pageH = site.offsetHeight;
    const vh = window.innerHeight;
    const isMobile = window.innerWidth <= 960;
    const ratio = isMobile ? 1100 / 1800 : 1500 / 1800;
    const scale = pageH / ratio / vh;
    const visible = vh * ratio;
    const yOffset = Math.abs((visible - vh) / 2);
    const z = 2000 * (1 - scale);

    gsap.set(site, { z, y: yOffset * scale, willChange: 'transform' });
    gsap.set(mainBg, { y: pageH, willChange: 'transform' });
    gsap.set(wrapper, { y: pageH, willChange: 'transform' });
    gsap.set(grid, { y: -pageH, willChange: 'transform' });

    const onFirstShownComplete = () => {
      if (cancelled) return;
      gsap.set([mainBg, wrapper, grid], { clearProps: 'willChange' });
      const heroImgs = Array.from(page.querySelectorAll<HTMLImageElement>('img.is-active'));
      Promise.resolve(waitForImages(heroImgs)).then(() => {
        if (cancelled) return;
        // Prod: separate tween, delay 1.5s after first phase completes
        const pull = gsap.to(site, {
          z: 0,
          y: 0,
          duration: 1.5,
          ease: 'power4.inOut',
          delay: 1.5,
          clearProps: 'all',
          onComplete: complete,
        });
        tweens.push(pull);
      });
    };

    // showPoster timeline (paused) — prod
    const showPoster = gsap.timeline({ paused: true });
    showPoster.to(page, { duration: 0.5, autoAlpha: 1, ease: EASE_CUBIC_OUT });
    showPoster.to(mainBg, { y: 0, duration: 1.2, ease: 'power3.inOut' }, 0);
    showPoster.to(wrapper, { y: 0, duration: 1.2, ease: 'power3.inOut' }, 0);
    showPoster.to(
      [footer, credit, logo].filter(Boolean),
      { opacity: 1, duration: 0.5, ease: EASE_QUART_OUT, clearProps: 'willChange' },
      1.2,
    );
    showPoster.to(
      grid,
      { y: 0, duration: 1.2, ease: 'power3.inOut', onComplete: onFirstShownComplete },
      0,
    );
    tweens.push(showPoster);

    // TL.show (base page) — fade poster in, then onShown +500ms → play showPoster
    const showTl = gsap.timeline({
      onComplete: () => {
        if (cancelled) return;
        playDelay = window.setTimeout(() => {
          if (!cancelled) showPoster.play(0);
        }, 500);
      },
    });
    showTl.to(page, { duration: 0.5, autoAlpha: 1, ease: EASE_CUBIC_OUT });
    tweens.push(showTl);

    const failsafe = window.setTimeout(complete, 10000);

    return () => {
      cancelled = true;
      window.clearTimeout(playDelay);
      window.clearTimeout(failsafe);
      tweens.forEach((t) => t.kill());
      gsap.killTweensOf([site, wrapper, grid, mainBg, page, credit, logo, footer].filter(Boolean));
      html.classList.remove('is-intro');
      html.style.overflow = '';
      html.style.pointerEvents = '';
      body.style.overflow = '';
      body.style.perspective = '';
      body.style.perspectiveOrigin = '';
      body.style.height = '';
      if (root) {
        root.style.transformStyle = '';
        root.style.height = '';
      }
      site.style.background = '';
      site.style.overflow = '';
      mainBg.style.display = '';
      if (labelGlobal) labelGlobal.style.display = '';
      if (logoGlobal) logoGlobal.style.display = '';
    };
  }, []);

  const grids = useMemo(() => featured, []);

  return (
    <WakaPage id="homepage" className={`layout-${layout}`} pageRef={rootRef}>
      <div className="scroll-wrapper">
        <div className="container">
          <h2 className="waka">Waka</h2>
          <a
            ref={creditRef}
            className="credit-link"
            href="https://www.instagram.com/abrahamcampillo/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Photo Abraham Campillo
          </a>
          <div className="waka__logo" ref={logoRef}>
            <WakaMark />
          </div>

          <div className="grid__animation-wrapper" ref={wrapperRef}>
            {grids.map((item, i) => {
              const active = i === chairIndex;
              return (
                <div
                  key={item.slug}
                  ref={active ? gridRef : undefined}
                  className={`grid${active ? ` grid--layout-${layout}` : ''}`}
                  data-name={item.name}
                  style={{ display: active ? 'flex' : 'none' }}
                >
                  <Link
                    to={`${WAKA_BASE}/${item.slug}`}
                    className="grid__item grid__item--featured"
                    aria-label={item.name}
                  >
                    <div className="grid__item-image">
                      <div
                        className="responsive-image is-loaded"
                        style={{
                          paddingTop: `${item.ratio1}%`,
                          backgroundColor: item.color1,
                        }}
                      >
                        {item.image1 ? (
                          <img
                            className="lazy is-active"
                            src={item.image1}
                            alt={item.name}
                            decoding="async"
                            data-sizes={layout === 0 ? '100vw' : '(min-width: 900px) 66vw, 100vw'}
                          />
                        ) : null}
                      </div>
                    </div>
                  </Link>

                  {item.image2 ? (
                    <Link
                      to={`${WAKA_BASE}/${item.slug}`}
                      className="grid__item grid__item--side"
                      aria-label={item.name}
                      aria-hidden={!showSide || !active}
                      style={active && !showSide ? { display: 'none' } : undefined}
                    >
                      <div className="grid__item-image">
                        <div
                          className="responsive-image is-loaded"
                          style={{ paddingTop: '125%', backgroundColor: item.color2 }}
                        >
                          <img
                            className={`lazy${showSide ? ' is-active' : ''}`}
                            src={item.image2}
                            alt=""
                            decoding="async"
                          />
                        </div>
                      </div>
                      <div className="grid__item-content">
                        <p>Object</p>
                        <h2>{item.name}</h2>
                      </div>
                    </Link>
                  ) : null}
                </div>
              );
            })}
          </div>

          <h2 className="waka waka--bottom">Waka</h2>
        </div>
      </div>
      <div className="page-overlay" aria-hidden />
      <span className="waka-sr-only">{chair?.name}</span>
    </WakaPage>
  );
}
