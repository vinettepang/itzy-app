import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * 底部逐个点亮的英文单词。
 * 还原 facilagencia.com 的 Footer logo 动效：
 *   滑到底部 → 字母先逐个上移（delay .1 + stagger .01）
 *   → 再逐个由浅灰 #d9d9d9 变深到 #1a1a1a（goBlack）
 * 真站用的是 6 个独立 SVG（f/a/c/i/l/®），这里用等宽大字替代，视觉等价。
 */

const DIM = '#d9d9d9';
const LIT = '#1a1a1a';

/** 想换词直接改这里（建议 4–8 个字母，太短/太长都会影响排版与节奏） */
const WORD = 'FACIL';

export default function PeopleFooter() {
  const rootRef = useRef<HTMLElement | null>(null);
  const lettersRef = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    const root = rootRef.current;
    const letters = lettersRef.current.filter(Boolean);
    if (!root || letters.length === 0) return;

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (reduced) {
      gsap.set(letters, { yPercent: 0, color: LIT, opacity: 1 });
      return;
    }

    // 初始：下沉 + 浅灰（未点亮）
    gsap.set(letters, { yPercent: 55, color: DIM, opacity: 0.55 });

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            // 点亮：上移 + 变深，逐个错开
            gsap.to(letters, {
              yPercent: 0,
              color: LIT,
              opacity: 1,
              duration: 0.8,
              delay: 0.1,
              stagger: 0.09,
              ease: 'power3.out',
              overwrite: true,
            });
          } else {
            // 离场：快速回落熄灭，回滑可重复触发
            gsap.to(letters, {
              yPercent: 55,
              color: DIM,
              opacity: 0.55,
              duration: 0.4,
              stagger: 0.03,
              ease: 'power2.in',
              overwrite: true,
            });
          }
        }
      },
      { threshold: 0.4 },
    );

    io.observe(root);
    return () => io.disconnect();
  }, []);

  return (
    <footer className="people-footer" ref={rootRef}>
      <div className="people-footer__word" aria-label={WORD}>
        {WORD.split('').map((ch, i) => (
          <span
            key={`${ch}-${i}`}
            className="people-footer__letter"
            aria-hidden="true"
            ref={(el) => {
              if (el) lettersRef.current[i] = el;
            }}
          >
            {ch}
          </span>
        ))}
        <span className="people-footer__mark" aria-hidden="true">
          ®
        </span>
      </div>
      <p className="people-footer__note">
        {WORD} es la gente que hace las cosas fáciles.
      </p>
    </footer>
  );
}
