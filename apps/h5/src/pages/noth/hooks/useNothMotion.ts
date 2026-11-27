import { useEffect, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** 绑定原站 class 的滚动动效：视差、作品光标、opacity/scale 揭示 */
export function useNothMotion(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const cleanups: (() => void)[] = [];

    el.querySelectorAll<HTMLElement>('[parallax]').forEach((node) => {
      const y = parseFloat(node.getAttribute('parallax-y') ?? '-60');
      const scrub = parseFloat(node.getAttribute('parallax-scrub') ?? '1.5');
      const tween = gsap.fromTo(
        node,
        { y: 0 },
        {
          y,
          ease: 'none',
          scrollTrigger: {
            trigger: node,
            start: 'top bottom',
            end: 'bottom top',
            scrub,
          },
        },
      );
      cleanups.push(() => tween.scrollTrigger?.kill());
    });

    el.querySelectorAll<HTMLElement>('[opacity]').forEach((node) => {
      const st = ScrollTrigger.create({
        trigger: node,
        start: 'top 88%',
        once: true,
        onEnter: () => gsap.to(node, { opacity: 1, duration: 0.8, ease: 'power2.out' }),
      });
      cleanups.push(() => st.kill());
    });

    el.querySelectorAll<HTMLElement>('[scale]').forEach((node) => {
      const delay = parseFloat(node.getAttribute('delay') ?? '0');
      const st = ScrollTrigger.create({
        trigger: node,
        start: 'top 90%',
        once: true,
        onEnter: () =>
          gsap.to(node, { scale: 1, duration: 0.6, delay, ease: 'back.out(1.4)' }),
      });
      cleanups.push(() => st.kill());
    });

    el.querySelectorAll<HTMLElement>('.work-link').forEach((link) => {
      const cursor = link.querySelector<HTMLElement>('.cursor-work');
      if (!cursor) return;
      gsap.set(cursor, {
        position: 'absolute',
        xPercent: -50,
        yPercent: -50,
        scale: 0,
        autoAlpha: 0,
        pointerEvents: 'none',
        zIndex: 10,
      });
      link.style.cursor = 'none';

      const onMove = (e: MouseEvent) => {
        const rect = link.getBoundingClientRect();
        gsap.to(cursor, {
          left: e.clientX - rect.left,
          top: e.clientY - rect.top,
          scale: 1,
          autoAlpha: 1,
          duration: 0.25,
          ease: 'power2.out',
        });
      };
      const onLeave = () => {
        gsap.to(cursor, { scale: 0, autoAlpha: 0, duration: 0.2 });
      };
      link.addEventListener('mousemove', onMove);
      link.addEventListener('mouseleave', onLeave);
      cleanups.push(() => {
        link.removeEventListener('mousemove', onMove);
        link.removeEventListener('mouseleave', onLeave);
      });
    });

    return () => {
      cleanups.forEach((fn) => fn());
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger && el.contains(t.trigger as Node)) t.kill();
      });
    };
  }, [root]);
}
