import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * facilagencia.com Footer 的 FÁCIL® logo —— 1:1 复刻。
 *
 * 字母造型直接用真站 sprite（public/facil-sprite.svg），每个字母是一个 <use>
 * 引用同一个 symbol，堆叠在同一 viewBox 0 0 1368 387 里，组合出完整 wordmark。
 *
 * 滑动效果（对照真站 Hn.goBlack 的非 fixed 分支）：
 *   FA   → delay 0.1s, duration ~0.3s → #1a1a1a
 *   CIL  → delay 0.5s, duration ~0.25s → #1a1a1a
 *   ®    → delay 1.1s, duration ~0.2s → #1a1a1a
 * 总时长 ≈ 1.35s。滚回时反向熄灭（可重复触发）。
 */

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

    // 字母本来就在背景（fill 浅灰、不位移）
    gsap.set(letters, { fill: DIM });

    const goBlack = () => {
      const [f, a, c, i, l, r] = letters;
      gsap.timeline({ overwrite: true })
        .to([f, a],         { fill: LIT, duration: 0.3, delay: 0.10, ease: 'power3.inOut' })
        .to([c, i, l],      { fill: LIT, duration: 0.25, delay: 0.20, ease: 'power3.inOut' }, '<')
        .to([r],            { fill: LIT, duration: 0.2, delay: 0.40, ease: 'power3.inOut' }, '<');
    };

    const goGrey = () => {
      gsap.timeline({ overwrite: true })
        .to(letters.slice(2, 5), { fill: DIM, duration: 0.2, stagger: 0.04, ease: 'power2.inOut' })
        .to(letters.slice(0, 2), { fill: DIM, duration: 0.2, ease: 'power2.inOut' }, '<')
        .to(letters[5],           { fill: DIM, duration: 0.2, ease: 'power2.inOut' }, '<');
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

  // 6 个字母分别放在同一 viewBox 里，叠成完整 FÁCIL®
  // sprite 里只有 f/a/c/i/l/r（r 是注册标），必须按 viewBox 位置叠放才正确
  const SPRITE = '/facil-sprite.svg';

  return (
    <footer className="people-footer" ref={rootRef}>
      <div className="people-footer__logo-wrap">
        <svg
          className="people-footer__logo"
          viewBox="0 0 1368 387.1"
          aria-label="Fácil"
        >
          <use href={`${SPRITE}#f`} className="people-footer__letter" data-letter="f"
            ref={(el) => { if (el) lettersRef.current[0] = el; }} />
          <use href={`${SPRITE}#a`} className="people-footer__letter" data-letter="a"
            ref={(el) => { if (el) lettersRef.current[1] = el; }} />
          <use href={`${SPRITE}#c`} className="people-footer__letter" data-letter="c"
            ref={(el) => { if (el) lettersRef.current[2] = el; }} />
          <use href={`${SPRITE}#i`} className="people-footer__letter" data-letter="i"
            ref={(el) => { if (el) lettersRef.current[3] = el; }} />
          <use href={`${SPRITE}#l`} className="people-footer__letter" data-letter="l"
            ref={(el) => { if (el) lettersRef.current[4] = el; }} />
          <use href={`${SPRITE}#r`} className="people-footer__mark" aria-label="registered"
            ref={(el) => { if (el) lettersRef.current[5] = el; }} />
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