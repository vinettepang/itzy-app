import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

type ScrollItem = {
  el: HTMLElement;
  top: number;
  height: number;
};

/**
 * Production-matching scroll: Lenis smooth scroll + CSS `--y` on `[data-scroll-item]`.
 * Insiders use CSS `transform: translate3d(var(--x), calc(var(--y)*var(--speed)*-1px), 0)`.
 * Formula: `--y = scrollY - itemAbsoluteTop` (same as production `Os.y - this.top`).
 */
export function useFacilScroll(rootRef: React.RefObject<HTMLElement | null>, pathname: string) {
  const lenisRef = useRef<Lenis | null>(null);
  const itemsRef = useRef<ScrollItem[]>([]);
  const scrollYRef = useRef(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    document.documentElement.classList.add('facil-scroll-active', 'lenis', 'lenis-smooth');

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
    });
    lenisRef.current = lenis;

    const measure = () => {
      const y = scrollYRef.current;
      const nodes = root.querySelectorAll<HTMLElement>('[data-scroll-item], [scroll-item]');
      itemsRef.current = Array.from(nodes).map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          el,
          top: rect.top + y,
          height: rect.height,
        };
      });
    };

    const draw = (y: number) => {
      scrollYRef.current = y;
      for (const item of itemsRef.current) {
        item.el.style.setProperty('--y', String(y - item.top));
      }
    };

    lenis.on('scroll', ({ scroll }: { scroll: number }) => {
      draw(scroll);
    });

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

    // Re-measure after images/layout settle
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
      document.documentElement.classList.remove('facil-scroll-active', 'lenis', 'lenis-smooth');
    };
  }, [rootRef]);

  // Re-measure + reset scroll on route change
  useEffect(() => {
    const root = rootRef.current;
    const lenis = lenisRef.current;
    if (!root) return;

    lenis?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
    scrollYRef.current = 0;

    const remount = () => {
      const y = 0;
      const nodes = root.querySelectorAll<HTMLElement>('[data-scroll-item], [scroll-item]');
      itemsRef.current = Array.from(nodes).map((el) => {
        const rect = el.getBoundingClientRect();
        return { el, top: rect.top + y, height: rect.height };
      });
      for (const item of itemsRef.current) {
        item.el.style.setProperty('--y', String(y - item.top));
      }
    };

    remount();
    const t1 = window.setTimeout(remount, 50);
    const t2 = window.setTimeout(remount, 350);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [pathname, rootRef]);
}
