import { useEffect } from 'react';
import Lenis from 'lenis';

export function useNothLenis(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const html = document.documentElement;
    html.classList.add('lenis', 'lenis-smooth');

    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      smoothWheel: true,
    });

    return () => {
      lenis.destroy();
      html.classList.remove('lenis', 'lenis-smooth');
    };
  }, [enabled]);
}
