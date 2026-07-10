import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useFacilScroll(rootRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    document.documentElement.classList.add('facil-scroll-active');

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const scope = root;
    const insiders = scope.querySelectorAll<HTMLElement>('[data-scroll-insider]');
    insiders.forEach((el) => {
      const speedY = parseFloat(el.dataset.speedY ?? el.dataset.speed ?? '0');
      const speedX = parseFloat(el.dataset.speedX ?? '0');
      gsap.to(el, {
        y: () => speedY * 120,
        x: () => speedX * 80,
        ease: 'none',
        scrollTrigger: {
          trigger: el.closest('[data-scroll-item]') ?? el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });

    ScrollTrigger.refresh();

  return () => {
      gsap.ticker.remove(tick);
      ScrollTrigger.getAll().forEach((st) => st.kill());
      lenis.destroy();
      document.documentElement.classList.remove('facil-scroll-active');
    };
  }, [rootRef]);
}
