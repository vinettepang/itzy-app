import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initScrollMotion(scope: HTMLElement): () => void {
  const kills: (() => void)[] = [];

  scope.querySelectorAll<HTMLElement>('[parallax]').forEach((node) => {
    const y = parseFloat(node.getAttribute('parallax-y') ?? '-60');
    const x = parseFloat(node.getAttribute('parallax-x') ?? '0');
    const scrub = parseFloat(node.getAttribute('parallax-scrub') ?? '1.5');
    const tween = gsap.fromTo(
      node,
      { y: 0, x: 0 },
      {
        y,
        x,
        ease: 'none',
        scrollTrigger: {
          trigger: node,
          start: 'top bottom',
          end: 'bottom top',
          scrub,
        },
      },
    );
    kills.push(() => tween.scrollTrigger?.kill());
  });

  scope.querySelectorAll<HTMLElement>('[parallax]').forEach((block) => {
    const host = block.querySelector('[parallax-img]') as HTMLElement | null;
    if (!host) return;

    let wrap: HTMLElement;
    let img: HTMLImageElement | null;
    if (host.tagName === 'IMG') {
      img = host as HTMLImageElement;
      wrap = host.parentElement!;
    } else {
      wrap = host;
      img = host.querySelector('img');
    }
    if (!img || !wrap) return;

    const y = parseFloat(host.getAttribute('parallax-img-y') ?? '-5');
    const scrub = parseFloat(host.getAttribute('parallax-img-scrub') ?? '2.5');
    gsap.set(wrap, { overflow: 'hidden' });
    gsap.set(img, { height: '110%', width: '100%', objectFit: 'cover', top: 0 });

    const tween = gsap.fromTo(
      img,
      { yPercent: 0 },
      {
        yPercent: y,
        ease: 'none',
        scrollTrigger: {
          trigger: block,
          start: 'top bottom',
          end: 'bottom top',
          scrub,
        },
      },
    );
    kills.push(() => tween.scrollTrigger?.kill());
  });

  scope.querySelectorAll<HTMLElement>('.work-link').forEach((link) => {
    if (link.closest('.section.works')) return;
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
    kills.push(() => {
      link.removeEventListener('mousemove', onMove);
      link.removeEventListener('mouseleave', onLeave);
    });
  });

  return () => kills.forEach((fn) => fn());
}
