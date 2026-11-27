import { useEffect, useRef, useState, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const STATES = {
  inner: {
    hidden: { opacity: 0, scale: 1.1, yPercent: 15 },
    visible: { opacity: 1, scale: 1, yPercent: 0 },
    exited: { opacity: 0, scale: 0.9, yPercent: 0 },
  },
  gradient: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  info: {
    hidden: { yPercent: 100 },
    visible: { yPercent: 0 },
  },
} as const;

type SlideRefs = {
  inner: HTMLElement;
  gradient: HTMLElement;
  infoSpans: HTMLElement[];
};

function setSlideState(slide: SlideRefs, state: 'hidden' | 'visible') {
  gsap.set(slide.inner, STATES.inner[state === 'visible' ? 'visible' : 'hidden']);
  gsap.set(slide.gradient, STATES.gradient[state === 'visible' ? 'visible' : 'hidden']);
  gsap.set(slide.infoSpans, STATES.info[state === 'visible' ? 'visible' : 'hidden']);
}

export function useSeriesMotion(mainRef: RefObject<HTMLElement | null>, slideCount: number) {
  const [activeIndex, setActiveIndex] = useState(0);
  const readyRef = useRef(false);

  useEffect(() => {
    const main = mainRef.current;
    if (!main || slideCount < 2) return;

    const series = Array.from(main.querySelectorAll<HTMLElement>('.serie.svelte-f64fwf'));
    const n = series.length;
    if (n < 2) return;

    const gradients = Array.from(
      main.querySelectorAll<HTMLElement>('[data-series-gradient]'),
    );

    const slides: SlideRefs[] = series.map((el, i) => ({
      inner: el.querySelector<HTMLElement>('.inner')!,
      gradient: gradients[i]!,
      infoSpans: Array.from(el.querySelectorAll<HTMLElement>('.info-item span')),
    }));

    const syncGradientStack = () => {
      gradients.forEach((g) => gsap.set(g, { opacity: 0 }));
    };

    slides.forEach((s) => {
      setSlideState(s, 'hidden');
      gsap.set(s.gradient, { opacity: 0 });
    });

    let scrollTimeline: gsap.core.Timeline | null = null;
    let enterTimeline: gsap.core.Timeline | null = null;
    let st: ScrollTrigger | null = null;

    const buildScrollTimeline = () => {
      scrollTimeline?.kill();
      scrollTimeline = gsap.timeline({ paused: true });

      for (let i = 0; i < n - 1; i++) {
        const current = slides[i];
        const next = slides[i + 1];
        const at = i * 1;

        scrollTimeline!.fromTo(
          current.inner,
          STATES.inner.visible,
          { ...STATES.inner.exited, duration: 0.6, ease: 'power4.inOut' },
          at,
        );
        scrollTimeline!.fromTo(
          current.gradient,
          STATES.gradient.visible,
          {
            ...STATES.gradient.hidden,
            duration: 0.6,
            ease: 'power4.in',
            immediateRender: false,
          },
          at,
        );
        scrollTimeline!.fromTo(
          next.inner,
          STATES.inner.hidden,
          { ...STATES.inner.visible, duration: 0.6, ease: 'power4.out' },
          at + 0.35,
        );
        scrollTimeline!.fromTo(
          next.gradient,
          STATES.gradient.hidden,
          {
            ...STATES.gradient.visible,
            duration: 0.6,
            ease: 'power4.out',
            immediateRender: false,
          },
          at + 0.35,
        );
        scrollTimeline!.fromTo(
          next.infoSpans,
          STATES.info.hidden,
          { ...STATES.info.visible, duration: 0.4, ease: 'power4.inOut', stagger: 0.075 },
          at + 0.46,
        );
      }

      st?.kill();
      st = ScrollTrigger.create({
        trigger: main,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          const progress = self.progress * (n - 1);
          scrollTimeline!.progress(self.progress);
          setActiveIndex(Math.round(progress) % (n - 1));
        },
      });
      scrollTimeline!.progress(0);
      gsap.set(slides[0].gradient, { opacity: 1 });
    };

    const attachSnap = () => {
      const isMobile = window.matchMedia('(max-width: 767px)').matches;
      const onWheelEnd = () => {
        const idx = Math.round(window.scrollY / window.innerHeight);
        const target = Math.min(idx, slideCount - 1) * window.innerHeight;
        if (Math.abs(window.scrollY - target) > 8) {
          window.scrollTo({ top: target, behavior: 'smooth' });
        }
      };
      let wheelTimer: number | undefined;
      const onScroll = () => {
        window.clearTimeout(wheelTimer);
        wheelTimer = window.setTimeout(onWheelEnd, isMobile ? 0 : 200);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      return () => {
        window.removeEventListener('scroll', onScroll);
        window.clearTimeout(wheelTimer);
      };
    };

    const startScroll = () => {
      slides.forEach((s, i) => setSlideState(s, i === 0 ? 'visible' : 'hidden'));
      syncGradientStack();
      gsap.set(slides[0].gradient, { opacity: 1 });
      buildScrollTimeline();
      return attachSnap();
    };

    let removeSnap: (() => void) | undefined;

    if (readyRef.current || window.scrollY > window.innerHeight * 0.5) {
      removeSnap = startScroll();
    } else {
      readyRef.current = true;
      const first = slides[0];
      enterTimeline = gsap.timeline({
        delay: 0.35,
        onComplete: () => {
          removeSnap = startScroll();
        },
      });
      enterTimeline.fromTo(
        first.inner,
        STATES.inner.hidden,
        { ...STATES.inner.visible, duration: 0.6, ease: 'power4.out' },
        0,
      );
      enterTimeline.fromTo(
        first.gradient,
        STATES.gradient.hidden,
        { ...STATES.gradient.visible, duration: 0.6, ease: 'power4.out' },
        0,
      );
      enterTimeline.fromTo(
        first.infoSpans,
        STATES.info.hidden,
        { ...STATES.info.visible, duration: 0.85, ease: 'power4.inOut', stagger: 0.1 },
        0.15,
      );
    }

    const onResize = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener('resize', onResize);

    return () => {
      readyRef.current = false;
      enterTimeline?.kill();
      scrollTimeline?.kill();
      st?.kill();
      removeSnap?.();
      window.removeEventListener('resize', onResize);
      ScrollTrigger.getAll().forEach((t) => t.kill());
      gradients.forEach((g) => gsap.set(g, { clearProps: 'opacity' }));
    };
  }, [mainRef, slideCount]);

  return activeIndex;
}

export function scrollToSeriesIndex(index: number, lenis: { scrollTo: (y: number, opts?: object) => void } | null) {
  const y = index * window.innerHeight;
  if (lenis) lenis.scrollTo(y, { duration: 2 });
  else window.scrollTo({ top: y, behavior: 'smooth' });
}
