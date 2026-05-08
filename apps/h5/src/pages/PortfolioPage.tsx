import { useEffect, useMemo, useRef, useState } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import WebGLOverlay from '@/portfolio/WebGLOverlay';
import './PortfolioPage.css';

gsap.registerPlugin(ScrollTrigger);

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
}

function isMobile() {
  return window.matchMedia?.('(max-width: 768px)')?.matches ?? false;
}

export default function PortfolioPage() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const velocityRef = useRef(0);
  const [webglEnabled, setWebglEnabled] = useState(false);

  const getScrollVelocity = useMemo(() => {
    return () => velocityRef.current;
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = prefersReducedMotion();
    const mobile = isMobile();
    setWebglEnabled(!reduced && !mobile);

    // Lenis smooth scroll (window)
    const lenis = new Lenis({
      duration: 1.35,
      easing: (t: number) => 1 - Math.pow(1 - t, 3.25),
      smoothWheel: true,
      wheelMultiplier: 0.9,
    });
    lenisRef.current = lenis;

    const onScroll = () => {
      // velocity is px/ms-ish in Lenis; normalize to a compact range
      const v = (lenis as unknown as { velocity?: number }).velocity ?? 0;
      velocityRef.current = clamp(v, -40, 40);
      root.style.setProperty('--v', String(velocityRef.current));
      ScrollTrigger.update();
    };

    lenis.on('scroll', onScroll);

    let raf = 0;
    const tick = (ms: number) => {
      lenis.raf(ms);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // Scroll-driven editorial motion (DOM) — “scenes”
    const ctx = gsap.context(() => {
      const scenes = gsap.utils.toArray<HTMLElement>('[data-scene]');
      scenes.forEach((scene, idx) => {
        const head = scene.querySelector<HTMLElement>('[data-head]');
        const deck = scene.querySelector<HTMLElement>('[data-deck]');

        gsap
          .timeline({
            scrollTrigger: {
              trigger: scene,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
            },
          })
          .fromTo(
            scene,
            { filter: 'blur(0px)' },
            { filter: idx % 2 ? 'blur(0px)' : 'blur(0.4px)', ease: 'none' },
            0,
          )
          .fromTo(
            head,
            { yPercent: 18, rotate: -2 },
            { yPercent: -10, rotate: 1.6, ease: 'none' },
            0,
          )
          .fromTo(
            deck,
            { yPercent: 10, opacity: 0.62 },
            { yPercent: -8, opacity: 1, ease: 'none' },
            0,
          );
      });

      // Parallax layer drift
      gsap.to('[data-drift]', {
        yPercent: -18,
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
        },
      });
    }, root);

    return () => {
      ctx.revert();
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return (
    <div ref={rootRef} className="pf-root" aria-label="Experimental fashion portfolio">
      <div className="pf-grid" aria-hidden="true" />
      <div className="pf-grain" aria-hidden="true" data-drift />

      {webglEnabled ? <WebGLOverlay getScrollVelocity={getScrollVelocity} /> : null}

      <header className="pf-hero" data-scene>
        <div className="pf-heroTop">
          <div className="pf-stamp">EXPERIMENT · PORTFOLIO</div>
          <div className="pf-stamp pf-stamp--right">SCROLL TO DIRECT</div>
        </div>
        <h1 className="pf-title" data-head>
          BRUTAL
          <span className="pf-titleSub">EDITORIAL MOTION</span>
        </h1>
        <p className="pf-deck" data-deck>
          A cinematic, heavy scroll that controls scenes. WebGL planes sync to DOM layouts and distort with GLSL.
        </p>
      </header>

      <main className="pf-main">
        <section className="pf-scene" data-scene>
          <div className="pf-slab">
            <div className="pf-kicker">SCENE 01</div>
            <h2 className="pf-h2" data-head>
              INDUSTRIAL
              <span className="pf-h2Alt">BLACK / WHITE</span>
            </h2>
            <p className="pf-copy" data-deck>
              Parallax depth, overlapping type, and a poster-like composition. Scroll velocity stretches media and nudges
              typography.
            </p>
          </div>
          <div className="pf-mediaWrap">
            <div className="pf-media" data-webgl-media />
            <div className="pf-caption">RGB split · wave deformation · velocity smear</div>
          </div>
        </section>

        <section className="pf-scene pf-scene--invert" data-scene>
          <div className="pf-mediaWrap">
            <div className="pf-media pf-media--tall" data-webgl-media />
            <div className="pf-caption">Mouse refraction · hover micro-liquid</div>
          </div>
          <div className="pf-slab">
            <div className="pf-kicker">SCENE 02</div>
            <h2 className="pf-h2" data-head>
              CHAOS
              <span className="pf-h2Alt">WITH INTENT</span>
            </h2>
            <p className="pf-copy" data-deck>
              Sections behave like scenes. No normal fades — leaving the viewport warps the frame, like a camera.
            </p>
          </div>
        </section>

        <section className="pf-scene" data-scene>
          <div className="pf-slab">
            <div className="pf-kicker">SCENE 03</div>
            <h2 className="pf-h2" data-head>
              STREET
              <span className="pf-h2Alt">CULTURE</span>
            </h2>
            <p className="pf-copy" data-deck>
              Brutalist editorial type blocks with absolute stamps, rotation, and blend-mode-like contrast.
            </p>
          </div>
          <div className="pf-collage">
            <div className="pf-sticker pf-sticker--a">ARCHIVE</div>
            <div className="pf-sticker pf-sticker--b">VOLUME 001</div>
            <div className="pf-media pf-media--wide" data-webgl-media />
          </div>
        </section>

        <footer className="pf-outro" data-scene>
          <div className="pf-outroLine" />
          <div className="pf-outroInner">
            <div className="pf-kicker">PERFORMANCE</div>
            <div className="pf-outroBig" data-head>
              RAF · LERP · MOBILE FALLBACK
            </div>
            <p className="pf-copy pf-copy--muted" data-deck>
              Heavy effects auto-disable on mobile / reduced motion. The experience stays editorial — not SaaS.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

