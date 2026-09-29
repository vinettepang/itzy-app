import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Lenis from 'lenis';
import './flustudio.css';

/* ------------------------------------------------------------------ */
/* content (ported from https://fluoro.london/studio/)                  */
/* ------------------------------------------------------------------ */

const SERVICES = [
  { lead: 'Brand', words: ['Depth', 'Impact'] },
  { lead: 'Advertising', words: ['Impact', 'Depth'] },
];

const GREEN_SLIDES = [
  'Optimistic and curious team who believe in cultural change for the good of society.',
  'Constant loop of critical thinking.',
  'Always evolving.',
];

const GIFS = [
  'https://fluoro.london/wp-content/uploads/2025/06/TAPE01-1.gif',
  'https://fluoro.london/wp-content/uploads/2025/06/FIDGET-SPINNER-01-1.gif',
  'https://fluoro.london/wp-content/uploads/2025/06/MUG-01-1.gif',
  'https://fluoro.london/wp-content/uploads/2025/06/Mushroom-01-1.gif',
  'https://fluoro.london/wp-content/uploads/2025/06/SIRACHA-01_V4.gif',
  'https://fluoro.london/wp-content/uploads/2025/06/SUNSCREEN-01_V2.gif',
  'https://fluoro.london/wp-content/uploads/2025/06/RUSH01_V2.gif',
];

const PARTNERS = [
  { name: 'R.A.D®', tags: ['Brand Strategy', 'Brand Identity', 'Advertising'] },
  { name: 'Adidas', tags: ['Advertising'] },
  { name: 'SKY SPORTS', tags: ['Advertising'] },
  { name: 'Sweaty Betty', tags: ['Brand Strategy', 'Brand Identity', 'Advertising'] },
  { name: 'Beats By Dre', tags: ['Advertising'] },
  { name: 'Snoop Dogg', tags: ['Brand Identity'] },
  { name: 'John Lewis', tags: ['Advertising'] },
  { name: 'Royal Academy Of Arts', tags: ['Advertising'] },
  { name: 'Ivy Park', tags: ['Brand Identity'] },
];

// Fullscreen video — original `block-image` (Vimeo 1053351078, 720p)
const VIDEO_SRC =
  'https://player.vimeo.com/progressive_redirect/playback/1053351078/rendition/720p/file.mp4?loc=external&log_user=0&signature=de4a6481561a982150558e9de7a5905e34c2cfc62b788319ab7c97db79b6ae20';

// Lottie block — original `block-lottie` (a Vimeo video, not an SVG)
const LOTTIE_DESKTOP =
  'https://player.vimeo.com/progressive_redirect/playback/1067702518/rendition/1080p/file.mp4?loc=external&log_user=0&signature=4cb66e7be7c68c11d722b4a25ac4c47e518e14645c58c79743e2ad4edbe496f3&user_id=54618465';
const LOTTIE_MOBILE =
  'https://player.vimeo.com/progressive_redirect/playback/1067702472/rendition/1080p/file.mp4?loc=external&log_user=0&signature=0815dc303cbc5eff59020079842599ce88438b5d411046ac66cd7473b23b1d91&user_id=54618465';

const EASE = [0.22, 1, 0.36, 1] as const;

/* ------------------------------------------------------------------ */
/* primitives                                                          */
/* ------------------------------------------------------------------ */

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}


/** Faithful replica of fluoro.london's `js-breathe-animation`.
 *  The original is NEITHER a font NOR a 3D/GLB model — it is a pre-rendered 120-frame
 *  WebP image sequence of glossy, inflated blue balloon letters, played back
 *  frame-by-frame on a 2D canvas, with scroll progress scrubbing the frame index (0→119).
 *  We replicate that exactly: the local sequence breathe1..breathe120.webp (served from
 *  /public/flustudio/breathe) is mapped scroll → frame and drawn with object-fit: cover
 *  onto the fixed full-screen canvas. */
const BREATHE_TOTAL = 120;

function BreatheSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let raf = 0;
    let running = false;
    let progress = 0;

    // preload the 120 WebP frames (served from /public/flustudio/breathe)
    const frames: HTMLImageElement[] = [];
    for (let i = 1; i <= BREATHE_TOTAL; i++) {
      const img = new Image();
      img.src = `/flustudio/breathe/breathe${i}.webp`;
      frames.push(img);
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const compute = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the section's top meets the viewport bottom, 1 when its bottom meets the top
      progress = Math.min(1, Math.max(0, (vh - rect.top) / (vh + rect.height)));
    };

    // object-fit: cover (matches the original drawImage cover logic)
    const drawCover = (img: HTMLImageElement) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const iw = img.naturalWidth || img.width;
      const ih = img.naturalHeight || img.height;
      if (!iw || !ih) return;
      const scale = Math.max(w / iw, h / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    };

    const draw = () => {
      if (running) compute(); // keep scroll progress fresh
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);
      if (running) {
        const p = reduce ? 0.5 : progress;
        const idx = Math.min(
          BREATHE_TOTAL - 1,
          Math.max(0, Math.round(p * (BREATHE_TOTAL - 1))),
        );
        const img = frames[idx];
        if (img && img.complete && img.naturalWidth) drawCover(img);
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    const io = new IntersectionObserver(
      ([entry]) => {
        running = entry.isIntersecting;
      },
      { threshold: 0 },
    );
    io.observe(section);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      io.disconnect();
    };
  }, []);

  return (
    <section ref={sectionRef} className="fs-breathe" aria-label="breathe">
      <canvas ref={canvasRef} className="fs-breathe__canvas" />
    </section>
  );
}

/** Word-sequence cycling line (js-word equivalent). */
function ServiceLine({ lead, words }: { lead: string; words: string[] }) {
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setI((v) => (v + 1) % words.length), 1700);
    return () => clearInterval(t);
  }, [words.length, reduce]);
  return (
    <div className="flustudio-service">
      <span className="flustudio-service__lead">
        {lead} <span className="span-blue">with</span>
      </span>
      <span className="flustudio-service__words">
        <AnimatePresence mode="wait">
          <motion.span
            key={i}
            className="flustudio-service__word"
            initial={{ y: '110%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            exit={{ y: '-110%', opacity: 0 }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            {words[i]}
          </motion.span>
        </AnimatePresence>
      </span>
    </div>
  );
}

function GreenSlider({ onChange }: { onChange?: (i: number) => void }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % GREEN_SLIDES.length), 3200);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    onChange?.(i);
  }, [i, onChange]);
  return (
    <div className="flustudio-slider">
      <AnimatePresence mode="wait">
        <motion.p
          key={i}
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -22 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          {GREEN_SLIDES[i]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* page                                                                */
/* ------------------------------------------------------------------ */

export default function FluStudioPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const [gifIdx, setGifIdx] = useState(0);
  const reduce = useReducedMotion();

  // Reveal-footer parallax (matches fluoro.london): the fixed footer is revealed
  // from underneath the content as you scroll to the end. The rose→white veil is
  // the last band of content; it covers the fixed blue footer while scrolling and,
  // because <main> gets a margin-bottom equal to the footer height, scrolling to
  // the very end lifts the veil away to reveal the blue.
  useEffect(() => {
    const footer = footerRef.current;
    const main = mainRef.current;
    const veil = veilRef.current;
    if (!footer || !main) return;
    const mq = window.matchMedia('(max-width: 1024px)');
    const apply = () => {
      const mb = mq.matches ? '0px' : `${footer.offsetHeight}px`;
      main.style.marginBottom = mb;
      if (veil) veil.style.height = mb;
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(footer);
    window.addEventListener('resize', apply);
    // footer height changes once webfonts load
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(apply);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', apply);
      main.style.marginBottom = '';
      if (veil) veil.style.height = '';
    };
  }, []);

  useEffect(() => {
    document.title = 'Studio - FLUORO®';
    const html = document.documentElement;
    const body = document.body;
    html.classList.add('lenis', 'lenis-smooth');
    let lenis: Lenis | null = null;
    if (!reduce) {
      lenis = new Lenis({
        autoRaf: true,
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
        smoothWheel: true,
      });
    }
    return () => {
      lenis?.destroy();
      html.classList.remove('lenis', 'lenis-smooth');
    };
  }, [reduce]);

  return (
    <div className="flustudio-root">
      <header className="flustudio-header">
        <Link to="/fluoro" className="flustudio-header__logo">
          FLUORO®
        </Link>
        <nav className="flustudio-header__nav">
          <a href="https://fluoro.london/" target="_blank" rel="noreferrer">
            Showcase.
          </a>
          <a href="https://fluoro.london/" target="_blank" rel="noreferrer">
            Index.
          </a>
          <a href="https://fluoro.london/studio/" target="_blank" rel="noreferrer" className="is-current">
            Studio.
          </a>
          <a href="https://fluoro.london/contact/" target="_blank" rel="noreferrer">
            Contact.
          </a>
        </nav>
      </header>

      <main ref={mainRef}>
        {/* HERO / studio-lede */}
        <section className="flustudio-lede flustudio-container">
          <motion.h1
            className="flustudio-lede__title"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            Creative agency that specialises in <span className="span-blue">*new-age</span> brand and
            advertising
          </motion.h1>
          <Reveal className="flustudio-lede__footnote" delay={0.15}>
            <span className="q">&ldquo;New-age?&rdquo; Sounds wanky!</span>
            <p>
              Basically, we needed a way to define our approach as one that blends the lasting impact
              of branding (long-term, vision, legacy) with the commercial urgency of advertising
              (short-term, attention-grabbing, action-driving) &ndash; so both work harder, together.
            </p>
          </Reveal>
        </section>

        <BreatheSection />

        {/* SERVICES */}
        <section className="flustudio-services flustudio-container">
          {SERVICES.map((s, idx) => (
            <Reveal key={s.lead} delay={idx * 0.08}>
              <ServiceLine lead={s.lead} words={s.words} />
            </Reveal>
          ))}
        </section>

        {/* FULLSCREEN VIDEO */}
        <Reveal className="flustudio-video">
          <div className="flustudio-video__fallback" />
          <video
            ref={videoRef}
            src={VIDEO_SRC}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onCanPlay={() => videoRef.current?.classList.add('is-ready')}
          />
        </Reveal>

        {/* GREEN TEXT BLOCK */}
        <section className="flustudio-textblock flustudio-textblock--green">
          <div className="flustudio-container">
            <Reveal>
              <p className="flustudio-textblock__eyebrow">What makes us unique</p>
              <GreenSlider onChange={setGifIdx} />
              <div className="flustudio-gif" aria-hidden="true">
                <img src={GIFS[gifIdx % GIFS.length]} alt="" loading="lazy" decoding="async" />
              </div>
            </Reveal>
          </div>
        </section>

        {/* LOTTIE (original block-lottie is a Vimeo video, not an SVG) */}
        <Reveal className="flustudio-lottie">
          <video
            ref={videoRef}
            className="flustudio-lottie__video"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          >
            <source
              media="(max-width: 529px)"
              src={LOTTIE_MOBILE}
              type="video/mp4"
            />
            <source src={LOTTIE_DESKTOP} type="video/mp4" />
          </video>
        </Reveal>

        {/* PARTNERS (original: vertical list, not a card grid) */}
        <section className="flustudio-partners flustudio-container">
          <Reveal>
            <h3 className="flustudio-partners__heading">Partners.</h3>
          </Reveal>
          <ul className="flustudio-partners__list">
            {PARTNERS.map((p, idx) => (
              <Reveal key={p.name} delay={(idx % 3) * 0.06}>
                <li className="flustudio-partner">
                  <span className="flustudio-partner__name">{p.name}</span>
                  <div className="flustudio-partner__tags">
                    {p.tags.map((t) => (
                      <span key={t} className="flustudio-pill">
                        {t}
                      </span>
                    ))}
                  </div>
                </li>
              </Reveal>
            ))}
          </ul>
        </section>

        {/* PINK TEXT BLOCK */}
        <section className="flustudio-textblock flustudio-textblock--pink">
          <div className="flustudio-container">
            <Reveal>
              <p className="flustudio-textblock__eyebrow">What are we challenging?</p>
              <p className="flustudio-textblock__statement">
                WE PRIORITISE LONG TERM SOCIETAL IMPACT, OVER SHORT TERM FINANCIAL SUCCESS
              </p>
            </Reveal>
          </div>
        </section>

        {/* CONTACT STRIP */}
        <section className="flustudio-contact flustudio-container">
          <h2 className="flustudio-contact__title">Get in touch</h2>
          <a className="flustudio-contact__email" href="mailto:studio@fluoro.london">
            studio@fluoro.london
          </a>
        </section>

        {/* rose→white veil: covers the fixed blue footer during scroll, parallax
            lifts it away at the end to reveal the blue (set in JS) */}
        <div ref={veilRef} className="flustudio-footer-veil" aria-hidden="true" />
      </main>

      <footer ref={footerRef} className="flustudio-footer">
        <div className="flustudio-container">
          <p className="flustudio-footer__lede">
            Replacing luxury&nbsp;and glamour with&nbsp;intrigue and attitude
          </p>
          <ul className="flustudio-footer__contact">
            <li>
              <a href="mailto:studio@fluoro.london">studio@fluoro.london</a>
            </li>
            <li>
              <a href="tel:+44 (0)20 3488 3111">+44 (0)20 3488 3111</a>
            </li>
            <li>
              <a href="https://www.instagram.com/fluoro.london/" target="_blank" rel="noreferrer">
                Instagram
              </a>
            </li>
          </ul>
          <div className="flustudio-footer__wordmark">
            <svg width="225" height="42" viewBox="0 0 225 42" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M28.0503 9.18354V1.42663H0V40.6421H8.85385V26.2252H26.5616V18.3508H8.85385V9.18354H28.0503ZM60.88 40.6421V32.8852H41.9579V1.42663H33.104V40.6421H60.88ZM80.3115 33.8646C75.7279 33.8646 72.7896 31.3965 72.7896 26.3428V1.42663H63.9358V25.6768C63.9358 36.607 70.2823 41.2298 79.9981 41.2298C89.2829 41.2298 96.1387 36.8029 96.1387 25.8727V1.42663H87.6766V26.1861C87.6766 31.2398 84.9343 33.8646 80.3115 33.8646ZM118.979 0.799805C108.675 0.799805 100.644 8.36084 100.644 21.0931C100.644 33.8646 108.636 41.269 118.979 41.269C129.321 41.269 137.313 33.8646 137.313 21.0931C137.274 8.36084 129.282 0.799805 118.979 0.799805ZM118.979 33.6687C113.024 33.6687 109.968 28.8501 109.968 21.054C109.968 12.8269 113.063 8.32166 118.979 8.32166C124.933 8.32166 127.989 12.7878 127.989 21.054C127.989 28.8501 124.894 33.6687 118.979 33.6687ZM172.141 29.0459C172.141 25.5201 169.947 22.2684 166.382 21.3674C170.652 19.6828 172.768 16.4312 172.768 12.3568C172.768 6.32367 168.576 1.42663 159.957 1.42663H141.975V40.6421H150.829V25.3242H158.429C161.681 25.3242 163.248 27.1655 163.365 30.1821L163.522 36.2152C163.561 37.939 163.679 39.8978 164.07 40.603H173.199C172.807 39.9761 172.415 38.2132 172.376 36.842L172.141 29.0459ZM150.79 18.2333V8.59589H158.625C162.229 8.59589 164.227 10.2805 164.227 13.4538C164.227 16.3528 161.837 18.1941 158.233 18.1941L150.79 18.2333ZM194.158 0.799805C183.855 0.799805 175.823 8.36084 175.823 21.0931C175.823 33.8646 183.815 41.269 194.158 41.269C204.461 41.269 212.492 33.8646 212.492 21.0931C212.453 8.36084 204.461 0.799805 194.158 0.799805ZM194.158 33.6687C188.203 33.6687 185.147 28.8501 185.147 21.054C185.147 12.8269 188.242 8.32166 194.158 8.32166C200.113 8.32166 203.168 12.7878 203.168 21.054C203.168 28.8501 200.074 33.6687 194.158 33.6687ZM224.285 40.6421V31.4749H215V40.603L224.285 40.6421Z" fill="#fff" />
            </svg>
            <span>&reg;</span>
          </div>
          <span className="flustudio-footer__copyright">© Fluoro Ltd. 2026</span>
          <a className="flustudio-footer__terms" href="https://fluoro.london/terms-conditions/" target="_blank" rel="noreferrer">
            Terms &amp; Conditions
          </a>
        </div>
      </footer>
    </div>
  );
}
