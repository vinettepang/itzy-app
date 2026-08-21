import { useEffect } from 'react';
import Lenis from 'lenis';

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
}

/** Window scroll damping via Lenis (wheel inertia / eased glide). */
export function useScrollDamping() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const html = document.documentElement;
    html.classList.add('lenis', 'lenis-smooth');

    const lenis = new Lenis({
      duration: 1.35,
      easing: (t: number) => 1 - Math.pow(1 - t, 3.25),
      smoothWheel: true,
      wheelMultiplier: 0.88,
      touchMultiplier: 1.05,
    });

    let raf = 0;
    const tick = (ms: number) => {
      lenis.raf(ms);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      html.classList.remove('lenis', 'lenis-smooth');
    };
  }, []);
}
