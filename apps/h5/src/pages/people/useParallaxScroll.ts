import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

type ScrollItem = {
  el: HTMLElement;
  top: number;
};

/**
 * facilagencia.com 同款滚动驱动：
 *   Lenis 平滑滚动 + 给每个 [data-scroll-item] 写 CSS 变量 `--y`
 *
 * 真站公式：`--y = 当前滚动量 - 元素绝对 top`（对应生产代码 `Os.y - this.top`），
 * 之后全部位移由 CSS 完成：
 *   纵向  translate3d(var(--x), calc(var(--y) * var(--speed) * -1px), 0)
 *   横向  --x: calc(var(--y) * var(--speed-x) * -1px)
 */
export function useParallaxScroll(rootRef: React.RefObject<HTMLElement | null>) {
  const lenisRef = useRef<Lenis | null>(null);
  const itemsRef = useRef<ScrollItem[]>([]);
  const scrollYRef = useRef(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      smoothWheel: !reduced,
      wheelMultiplier: 0.9,
    });
    lenisRef.current = lenis;

    const measure = () => {
      const y = scrollYRef.current;
      const nodes = root.querySelectorAll<HTMLElement>('[data-scroll-item]');
      itemsRef.current = Array.from(nodes).map((el) => ({
        el,
        top: el.getBoundingClientRect().top + y,
      }));
    };

    const draw = (y: number) => {
      scrollYRef.current = y;
      for (const item of itemsRef.current) {
        item.el.style.setProperty('--y', String(y - item.top));
      }
    };

    lenis.on('scroll', ({ scroll }: { scroll: number }) => draw(scroll));

    let raf = 0;
    const tick = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    measure();
    draw(window.scrollY || 0);

    const onResize = () => {
      measure();
      draw(scrollYRef.current);
    };
    window.addEventListener('resize', onResize);

    // 图片/字体加载会改变布局，稳定后再量一次
    const settle = window.setTimeout(() => {
      measure();
      draw(scrollYRef.current);
    }, 300);

    return () => {
      window.clearTimeout(settle);
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [rootRef]);
}

/**
 * 可见度驱动：进入视口时把 `--visibility` 从 0 过渡到 1
 * （真站用同一变量控制 filter: saturate() 与名字标签的 opacity）
 */
export function useVisibilityReveal(rootRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const items = Array.from(root.querySelectorAll<HTMLElement>('[data-scroll-item]'));
    if (items.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          el.style.setProperty('--visibility', entry.isIntersecting ? '1' : '0');
        }
      },
      { rootMargin: '-8% 0px -8% 0px', threshold: 0 },
    );

    items.forEach((el) => {
      el.style.setProperty('--visibility', '0');
      io.observe(el);
    });

    return () => io.disconnect();
  }, [rootRef]);
}
