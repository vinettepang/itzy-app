import { useEffect, type RefObject } from 'react';
import gsap from 'gsap';

const HERO_LINES = [
  'Observations of a world in motion and a',
  'quest for unordinary moments within the',
  'ordinary, captured by Félix Péault.',
] as const;

export { HERO_LINES };

const CAROUSEL_MS = 1000;

export function useHomepageMotion(
  photosRef: RefObject<HTMLAnchorElement | null>,
  descriptionRef: RefObject<HTMLHeadingElement | null>,
  photoCount: number,
) {
  useEffect(() => {
    const photosEl = photosRef.current;
    const descEl = descriptionRef.current;
    if (!photosEl || photoCount < 1) return;

    const photos = Array.from(photosEl.querySelectorAll<HTMLElement>('.photo'));
    const lines = descEl ? Array.from(descEl.querySelectorAll<HTMLElement>('.line')) : [];

    gsap.set(photosEl, { opacity: 0, scale: 1.05, yPercent: 10 });
    if (lines.length) gsap.set(lines, { yPercent: 110 });

    const enter = gsap.timeline({ defaults: { ease: 'power4.inOut' } });
    enter.to(photosEl, { opacity: 1, scale: 1, yPercent: 0, duration: 1 }, 0);
    if (lines.length) {
      enter.to(
        lines,
        { yPercent: 0, duration: 1.5, stagger: 0.2, ease: 'power4.inOut' },
        0.325,
      );
    }

    if (photos.length < 2) return () => enter.kill();

    gsap.set(photos[0], { opacity: 1, scale: 1, yPercent: 0 });
    gsap.set(photos.slice(1), { opacity: 0, scale: 1.1, yPercent: 15 });

    let active = 0;
    const advance = () => {
      const next = (active + 1) % photos.length;
      const tl = gsap.timeline();
      tl.to(
        photos[active],
        { opacity: 0, scale: 0.9, duration: 1, ease: 'power4.inOut' },
        0,
      );
      tl.fromTo(
        photos[next],
        { yPercent: 10, scale: 1.05, opacity: 0 },
        { yPercent: 0, scale: 1, opacity: 1, duration: 1, ease: 'power4.out' },
        0.575,
      );
      photos[active].classList.remove('is-active');
      photos[next].classList.add('is-active');
      active = next;
    };

    let intervalId = window.setInterval(advance, CAROUSEL_MS);
    const onVisibility = () => {
      if (document.hidden) {
        window.clearInterval(intervalId);
        intervalId = 0;
      } else if (!intervalId) {
        intervalId = window.setInterval(advance, CAROUSEL_MS);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      enter.kill();
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibility);
      gsap.killTweensOf([photosEl, ...photos, ...lines]);
    };
  }, [photosRef, descriptionRef, photoCount]);
}
