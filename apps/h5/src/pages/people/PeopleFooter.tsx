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
      gsap.set(letters, { color: LIT });
      return;
    }

    // 字母本来就落在背景里，保持原位、只有颜色变化（灰 → 黑）
    gsap.set(letters, { color: DIM });

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            // 快接近底部：挨个点亮（只动颜色，不位移）
            gsap.to(letters, {
              color: LIT,
              duration: 0.45,
              stagger: 0.14,
              ease: 'power2.out',
              overwrite: true,
            });
          } else {
            // 回滑熄灭，可重复触发
            gsap.to(letters, {
              color: DIM,
              duration: 0.35,
              stagger: 0.06,
              ease: 'power2.in',
              overwrite: true,
            });
          }
        }
      },
      // 底部留 12% 余量，让「快接近底部」就触发，而不是完全到底才动
      { rootMargin: '0px 0px -12% 0px', threshold: 0.2 },
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
