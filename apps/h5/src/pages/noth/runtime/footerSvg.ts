import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** main `dx` / `RC` */
export function initFooterSvg(scope: HTMLElement): () => void {
  const wrappers = [...scope.querySelectorAll<HTMLElement>('.footer-svg-w')];
  if (!wrappers.length) return () => {};

  const cleanups: (() => void)[] = [];

  wrappers.forEach((wrapper) => {
    const paths = [...wrapper.querySelectorAll<SVGPathElement>('path')];
    if (!paths.length) return;

    const svg = wrapper.querySelector<SVGElement>('svg');
    paths.forEach((p) => gsap.set(p, { transformOrigin: '50% 50%' }));
    if (svg) svg.style.overflow = 'hidden';
    wrapper.style.overflow = 'hidden';

    const apos = paths[paths.length - 1];
    const letters = paths.slice(0, -1);
    gsap.set(letters, { autoAlpha: 1, yPercent: 120 });
    gsap.set(apos, { autoAlpha: 1, scale: 0 });

    const revealOverflow = () => {
      if (svg) svg.style.overflow = 'visible';
      wrapper.style.overflow = 'visible';
    };

    const revealSt = ScrollTrigger.create({
      trigger: wrapper,
      start: 'top 95%',
      once: true,
      onEnter: () => {
        const order = letters.slice().sort(() => Math.random() - 0.5);
        gsap.fromTo(
          order,
          { autoAlpha: 1, yPercent: 120 },
          {
            yPercent: 0,
            duration: 1.2,
            ease: 'power4.inOut',
            stagger: 0.03,
            delay: 0.2,
            onComplete: revealOverflow,
          },
        );
        gsap.fromTo(
          apos,
          { autoAlpha: 1, scale: 0 },
          { scale: 1, duration: 0.6, ease: 'back.out(0.9)', delay: 1 },
        );
      },
    });

    const hoverHandlers = paths.map((path) => {
      let busy = false;
      const onEnter = () => {
        if (busy) return;
        busy = true;
        gsap
          .timeline({
            onComplete: () => {
              busy = false;
            },
          })
          .to(path, { scale: 0.05, duration: 0.6, ease: 'power2.inOut' })
          .to(path, { scale: 1, duration: 1.8, ease: 'elastic.out(1, 0.8)' });
      };
      path.addEventListener('mouseenter', onEnter);
      return { path, onEnter };
    });

    cleanups.push(() => {
      revealSt.kill();
      hoverHandlers.forEach(({ path, onEnter }) => {
        path.removeEventListener('mouseenter', onEnter);
        gsap.killTweensOf(path);
      });
    });
  });

  return () => cleanups.forEach((fn) => fn());
}
