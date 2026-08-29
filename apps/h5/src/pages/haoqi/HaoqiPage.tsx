import { Link } from 'react-router-dom';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Lenis from 'lenis';
import { assetUrl } from '@/utils/assetUrl';
import { HAOQI_WORK } from './workData';
import HaoqiHeroCanvas from './HaoqiHeroCanvas';
import HaoqiFrameChrome from './HaoqiFrameChrome';
import RedactedCompany from './RedactedCompany';
import { useHaoqiTheme } from './hooks/useHaoqiTheme';
import type { HaoqiPointer } from './scene/types';
import './haoqi.css';

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

function HoverBox({
  as = 'button',
  className = '',
  children,
  ...rest
}: {
  as?: 'button' | 'a';
  className?: string;
  children: React.ReactNode;
} & Record<string, unknown>) {
  const cls = `haoqi__hoverbox ${className}`.trim();
  if (as === 'a') {
    return (
      <a className={cls} {...(rest as object)}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" className={cls} {...(rest as object)}>
      {children}
    </button>
  );
}

export default function HaoqiPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bannerProgressRef = useRef(0);
  const footerProgressRef = useRef(0);
  const hoveredWorkRef = useRef(-1);
  const workRevealRef = useRef<number[]>(HAOQI_WORK.map(() => 0));
  const pointerRef = useRef<HaoqiPointer>({
    x: 0,
    y: 0,
    ndcX: 0,
    ndcY: 0,
    active: false,
  });
  const { isDark, cycle, label } = useHaoqiTheme();
  const [sound, setSound] = useState(() => {
    try {
      return sessionStorage.getItem('haoqi_sound') !== 'off';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem('haoqi_sound', sound ? 'on' : 'off');
    } catch {
      /* ignore */
    }
  }, [sound]);
  const [webglReady, setWebglReady] = useState(false);

  const lenisRef = useRef<Lenis | null>(null);

  const updateScrollProgress = useCallback((scroll: number) => {
    const workEl = document.getElementById('selected-work');
    const bannerRange = (workEl?.offsetTop ?? window.innerHeight) - window.innerHeight * 0.35;
    const sync = 0.72;
    bannerProgressRef.current = Math.min(1, Math.max(0, scroll / Math.max(bannerRange * sync, 1)));

    const contactEl = document.getElementById('contact');
    if (contactEl) {
      const start = contactEl.offsetTop - window.innerHeight * 0.55;
      const span = Math.max(contactEl.offsetHeight * 0.65, window.innerHeight * 0.4);
      footerProgressRef.current = Math.min(1, Math.max(0, (scroll - start) / span));
    }
  }, []);

  // Lenis 平滑滚动（作用于 haoqi 滚动容器）
  useEffect(() => {
    const wrapper = rootRef.current;
    const content = scrollRef.current;
    if (!wrapper || !content) return;

    if (prefersReducedMotion()) {
      const onScroll = () => updateScrollProgress(wrapper.scrollTop);
      wrapper.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
      return () => wrapper.removeEventListener('scroll', onScroll);
    }

    const lenis = new Lenis({
      wrapper,
      content,
      duration: 1.25,
      easing: (t: number) => 1 - Math.pow(1 - t, 3.2),
      smoothWheel: true,
    });
    lenisRef.current = lenis;
    lenis.on('scroll', ({ scroll }) => updateScrollProgress(scroll));

    let raf = 0;
    const tick = (ms: number) => {
      lenis.raf(ms);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [updateScrollProgress]);

  useEffect(() => {
    if (!webglReady) return;
    const root = rootRef.current;
    if (!root) return;
    const medias = root.querySelectorAll<HTMLElement>('.haoqi__workMedia');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = Array.from(medias).indexOf(entry.target as HTMLElement);
          if (idx < 0) return;
          workRevealRef.current[idx] = entry.intersectionRatio;
        });
      },
      { root, threshold: Array.from({ length: 11 }, (_, i) => i / 10) },
    );
    medias.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [webglReady]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      pointerRef.current = {
        x: e.clientX,
        y: e.clientY,
        ndcX: (e.clientX / w) * 2 - 1,
        ndcY: -((e.clientY / h) * 2 - 1),
        active: true,
      };
    };
    const onLeave = () => {
      pointerRef.current.active = false;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  const scrollToId = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (lenisRef.current) lenisRef.current.scrollTo(el, { offset: 0 });
    else el.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <div
      ref={rootRef}
      className={`haoqi${isDark ? ' haoqi--dark' : ''}${webglReady ? ' haoqi--webgl-active' : ''}`}
    >
      {/* WebGL 背景 */}
      <div className="haoqi__bg" aria-hidden="true">
        <HaoqiHeroCanvas
          isDark={isDark}
          bannerProgressRef={bannerProgressRef}
          footerProgressRef={footerProgressRef}
          pointerRef={pointerRef}
          hoveredWorkRef={hoveredWorkRef}
          scrollRootRef={rootRef}
          workRevealRef={workRevealRef}
          onReady={() => setWebglReady(true)}
        />
      </div>

      {/* 网格准星 */}
      <span className="haoqi__cross haoqi__cross--tl" aria-hidden="true" />
      <span className="haoqi__cross haoqi__cross--tr" aria-hidden="true" />
      <span className="haoqi__cross haoqi__cross--bl" aria-hidden="true" />
      <span className="haoqi__cross haoqi__cross--br" aria-hidden="true" />
      <span className="haoqi__cross haoqi__cross--c" aria-hidden="true" />

      {/* 固定 header / footer 框架 */}
      <HaoqiFrameChrome
        themeLabel={label}
        onThemeCycle={cycle}
        sound={sound}
        onSoundToggle={() => setSound((s) => !s)}
        onWork={() => scrollToId('selected-work')}
        onContact={() => scrollToId('contact')}
      />

      <div className="haoqi__frameOverlays" aria-hidden="false">
          <div className="haoqi__brandBlock">
            <div className="haoqi__brandTitle">
              Design &amp;
              <br />
              Engineering
            </div>
          </div>
          <div className="haoqi__topCenter">
            <img className="haoqi__pixelIcon" src={assetUrl('/haoqi-static/img/m3.png')} alt="" aria-hidden="true" />
            {'Thinking in systems.\nDesigning with care.'}
          </div>
          <div className="haoqi__intro">
            <span className="haoqi__introKicker">Work</span>
            I'm Haoqi Wen, leading Design Engineering and AI exploration at <RedactedCompany />, engineering, and AI at
            scale. Outside work, I build design tools for team efficiency.
          </div>
        </div>

      {/* 滚动内容 */}
      <div ref={scrollRef} className="haoqi__scroll">
        <main className="haoqi__content">
          {/* HERO */}
          <section className="haoqi__hero" id="haoqi-hero">
            <h1 className="haoqi__heroTitle">
              I bring
              <br />
              craft &amp; taste
              <br />
              to digital work
            </h1>
            <div className="haoqi__heroSub">
              <p>
                I explore how to shape AI-era workflows with craft and taste, building the next
                generation of digital products.
              </p>
              <p>
                I'm building{' '}
                <a className="haoqi__inlineLink" href="https://www.reunimos.cc/" target="_blank" rel="noreferrer">
                  reunimos™
                </a>
                , and previously worked on Alibaba{' '}
                <a className="haoqi__inlineLink" href="https://www.alipan.com/" target="_blank" rel="noreferrer">
                  aDrive
                </a>
                ,{' '}
                <a className="haoqi__inlineLink" href="https://www.teambition.com/" target="_blank" rel="noreferrer">
                  Teambition
                </a>
                , and 100offer.
              </p>
            </div>
          </section>

          {/* WORK */}
          <section className="haoqi__work" id="selected-work">
            <div className="haoqi__workGrid">
              {HAOQI_WORK.map((item, index) => {
                const media = (
                  <div
                    className="haoqi__workMedia"
                    style={{ aspectRatio: item.aspectRatio }}
                    aria-hidden="true"
                  >
                    {item.tag ? <span className="haoqi__workBadgeTag">{item.tag}</span> : null}
                    <img src={item.img} alt="" loading="lazy" />
                    {item.hoverImg ? (
                      <img className="haoqi__workImg--hover" src={item.hoverImg} alt="" loading="lazy" />
                    ) : null}
                  </div>
                );
                const caption = (
                  <div className="haoqi__workCaption">
                    <span className="haoqi__workName">{item.name}</span>
                    <div className="haoqi__workYearRow">
                      {item.badge ? (
                        <span className="haoqi__workBadge">
                          {item.badge} <span aria-hidden="true">↗</span>
                        </span>
                      ) : null}
                      <span>{item.year}</span>
                    </div>
                  </div>
                );
                const label = `${item.name} - ${item.year}${item.external ? ' (external)' : ''}`;

                return (
                  <article
                    key={item.name}
                    className={`haoqi__workCard ${item.gridClass}`}
                    onMouseEnter={() => {
                      hoveredWorkRef.current = index;
                    }}
                    onMouseLeave={() => {
                      hoveredWorkRef.current = -1;
                    }}
                  >
                    {item.external || !item.href ? (
                      <a
                        className="haoqi__workLink"
                        href={item.href ?? '#'}
                        aria-label={label}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {media}
                        {caption}
                      </a>
                    ) : (
                      <Link className="haoqi__workLink" to={item.href} aria-label={label}>
                        {media}
                        {caption}
                      </Link>
                    )}
                  </article>
                );
              })}
            </div>
          </section>

          {/* CONTACT */}
          <section className="haoqi__contact" id="contact">
            <div className="haoqi__contactKicker">Innovate with purpose</div>
            <h2 className="haoqi__contactTitle">
              Let's create
              <br />
              something
              <br />
              extraordinary
            </h2>
            <div className="haoqi__contactBottom">
              <a className="haoqi__contactEmail" href="mailto:curiosity.wen@gmail.com">
                curiosity.wen@gmail.com
              </a>
              <div className="haoqi__contactSocials">
                <HoverBox as="a" href="https://twitter.com/wenhaoqi" target="_blank" rel="noreferrer">
                  <span>Twitter/X</span>
                </HoverBox>
                <HoverBox as="a" href="https://www.figma.com/@wenhaoqi" target="_blank" rel="noreferrer">
                  <span>Figma</span>
                </HoverBox>
                <HoverBox as="a" href="https://github.com/wenhaoqiasd" target="_blank" rel="noreferrer">
                  <span>GitHub</span>
                </HoverBox>
              </div>
            </div>
            <div style={{ marginTop: 48, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--label-3)' }}>
              HAOQI © {year}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
