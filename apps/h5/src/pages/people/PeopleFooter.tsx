import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * facilagencia.com Footer 的 FÁCIL® logo —— 1:1 复刻
 *
 * 字母 path 直接内联自真站 sprite（public/facil-sprite.svg 的 6 个 symbol），
 * 用同文档 <use href="#f"> 引用，避免外部 sprite 引用在浏览器里的兼容性问题。
 *
 * 滑动效果（对照真站 Hn.goBlack 非 fixed 分支）：
 *   [FA]  delay 0.10s → #1a1a1a
 *   [CIL] delay 0.30s → #1a1a1a
 *   [®]   delay 0.70s → #1a1a1a
 * 总时长 ≈ 1s。滚回时反向熄灭（可重复触发）。
 */

// 内联 6 个 symbol（1465B），保证同文档 <use href="#...">
const SPRITE_DEFS = `
<symbol viewBox="0 0 1368 387.1" id="fa"><path d="M511.31 36.15H335.6L226.19 378.1h129.77l13.74-54.94h98.04L481 378.1h140.19zM390.07 239.81l29.84-128.82h.95l27 128.82h-57.78z"/></symbol>
<symbol viewBox="0 0 1368 387.1" id="fc"><path d="M773.7 298.06c-34.1 0-36.94-38.84-36.94-90.93 0-54.94 3.31-90.93 38.36-90.93 16.58 0 30.79 7.58 32.68 46.41h124.09C931.42 62.2 858.48 27.16 772.28 27.16c-115.57 0-179.03 71.99-175.71 178.55 0 108.46 55.41 181.39 175.24 181.39 42.62 0 82.41-10.42 111.77-32.21 29.36-22.26 48.31-56.36 48.31-103.25H804.96c-1.9 36-13.74 46.42-31.26 46.42Z"/></symbol>
<symbol viewBox="0 0 1368 387.1" id="ff"><path d="M260.02 125.19V36.15H0V378.1h135.45V250.7h116.04v-89.04H135.45v-36.47h124.57z"/></symbol>
<symbol viewBox="0 0 1368 387.1" id="fi"><path d="M952.21 36.15h135.45V378.1H952.21z"/></symbol>
<symbol viewBox="0 0 1368 387.1" id="fl"><path d="M1243.44 286.22V36.15h-135.45V378.1H1368v-91.88h-124.56z"/></symbol>
<symbol viewBox="0 0 1368 387.1" id="fr"><path d="M598.9 32.4c0-9.3-5.1-12.8-17.6-12.8h-15.6v40.5h9.8V44h3.6l8.1 16.1h11.1l-8.7-16.7c6.6-.6 9.3-4.9 9.3-11Zm-15.5 3.7h-7.9v-8.8h6.2c5.5 0 7.3 1.5 7.3 4s-1 4.8-5.7 4.8Zm-2-36.1c-22 0-39.8 17.8-39.8 39.8s17.8 39.8 39.8 39.8 39.8-17.8 39.8-39.8S603.4 0 581.4 0Zm0 69.8c-16.5 0-30-13.5-30-30s13.5-30 30-30 30 13.5 30 30-13.5 30-30 30Z"/></symbol>
`.trim();

const DIM = '#f5f5f5';
const LIT = '#1a1a1a';

export default function PeopleFooter() {
  const rootRef = useRef<HTMLElement | null>(null);
  const lettersRef = useRef<SVGUseElement[]>([]);

  useEffect(() => {
    const root = rootRef.current;
    const letters = lettersRef.current.filter(Boolean);
    if (!root || letters.length === 0) return;

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (reduced) {
      gsap.set(letters, { fill: LIT });
      return;
    }

    // 字母本来就在背景（浅灰、不位移）
    gsap.set(letters, { fill: DIM });

    const goBlack = () => {
      const [f, a, c, i, l, r] = letters;
      gsap.timeline({ overwrite: true })
        .to([f, a], { fill: LIT, duration: 0.3, ease: 'power3.inOut' }, 0.1)
        .to([c, i, l], { fill: LIT, duration: 0.25, ease: 'power3.inOut' }, 0.3)
        .to([r], { fill: LIT, duration: 0.2, ease: 'power3.inOut' }, 0.7);
    };

    const goGrey = () => {
      // 反向时按点亮顺序回退（先 CIL，再 FA，再 ®）
      gsap.timeline({ overwrite: true })
        .to([letters[2], letters[3], letters[4]], { fill: DIM, duration: 0.2, ease: 'power2.inOut' })
        .to([letters[0], letters[1]], { fill: DIM, duration: 0.2, ease: 'power2.inOut' }, '<')
        .to([letters[5]], { fill: DIM, duration: 0.2, ease: 'power2.inOut' }, '<');
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) goBlack();
          else goGrey();
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.2 },
    );
    io.observe(root);

    return () => io.disconnect();
  }, []);

  // 用同文档 <use> 引用内联 symbol（用 fa/fc/ff/fi/fl/fr 避免和 React/HTML 关键字冲突）
  return (
    <footer className="people-footer" ref={rootRef}>
      <div className="people-footer__logo-wrap" dangerouslySetInnerHTML={{ __html: `<svg xmlns="http://www.w3.org/2000/svg" style="display:none"><defs>${SPRITE_DEFS}</defs></svg>` }} />
      <div className="people-footer__logo-wrap">
        <svg
          className="people-footer__logo"
          viewBox="0 0 1368 387.1"
          aria-label="Fácil"
        >
          <use href="#ff" data-letter="f" ref={(el) => { if (el) lettersRef.current[0] = el as SVGUseElement; }} />
          <use href="#fa" data-letter="a" ref={(el) => { if (el) lettersRef.current[1] = el as SVGUseElement; }} />
          <use href="#fc" data-letter="c" ref={(el) => { if (el) lettersRef.current[2] = el as SVGUseElement; }} />
          <use href="#fi" data-letter="i" ref={(el) => { if (el) lettersRef.current[3] = el as SVGUseElement; }} />
          <use href="#fl" data-letter="l" ref={(el) => { if (el) lettersRef.current[4] = el as SVGUseElement; }} />
          <use href="#fr" data-letter="®" ref={(el) => { if (el) lettersRef.current[5] = el as SVGUseElement; }} />
        </svg>

        <ul className="people-footer__contact" aria-label="Contacto">
          <li><a className="pill" href="mailto:hola@facilagencia.com">hola@facilagencia.com</a></li>
          <li><a className="pill" href="tel:+34608286478">+34 608 286 478</a></li>
          <li><span className="pill pill--block">Fernando VI 2, 1º Dcha, 28004, Madrid</span></li>
          <li><a className="pill pill--sm" href="https://www.instagram.com/facilagencia_/" target="_blank" rel="noreferrer">Instagram</a></li>
          <li><a className="pill pill--sm" href="https://www.linkedin.com/company/facilagenciaindependiente" target="_blank" rel="noreferrer">Linkedin</a></li>
        </ul>
      </div>

      <p className="people-footer__legal">
        <span>Hecho con mimo por </span>
        <span className="people-footer__brand">Fácil</span>
        <span> · Madrid, 2026</span>
      </p>
    </footer>
  );
}