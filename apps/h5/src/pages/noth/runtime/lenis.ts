import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const EASING = (t: number) => Math.min(1, 1.001 - 2 ** (-10 * t));

export type NothLenisHandle = {
  lenis: Lenis;
  destroy: () => void;
};

export function createNothLenis(): NothLenisHandle {
  const html = document.documentElement;
  html.classList.add('lenis', 'lenis-smooth');

  const lenis = new Lenis({
    autoRaf: false,
    duration: 1.1,
    easing: EASING,
    smoothWheel: true,
  });

  const onScroll = () => ScrollTrigger.update();
  lenis.on('scroll', onScroll);

  const ticker = (time: number) => {
    lenis.raf(time * 1000);
  };
  gsap.ticker.add(ticker);
  gsap.ticker.lagSmoothing(0);

  ScrollTrigger.scrollerProxy(document.documentElement, {
    scrollTop(value) {
      if (arguments.length) {
        lenis.scrollTo(value, { immediate: true });
      }
      return lenis.scroll;
    },
    getBoundingClientRect() {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };
    },
  });

  return {
    lenis,
    destroy() {
      lenis.off?.('scroll', onScroll);
      gsap.ticker.remove(ticker);
      ScrollTrigger.scrollerProxy(document.documentElement, {});
      lenis.destroy();
      html.classList.remove('lenis', 'lenis-smooth');
    },
  };
}
