import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  hydrateLetterRevealDom,
  hydrateLineRevealDom,
  type DomRestore,
} from './lineDom';

gsap.registerPlugin(ScrollTrigger);

type PlayFn = (immediate?: boolean) => void;

const ST_START = 'top 95%';

function inScope(scope: HTMLElement, el: Element) {
  return scope.contains(el);
}

function parseDelay(el: Element) {
  return parseFloat(el.getAttribute('delay') ?? el.getAttribute('data-delay') ?? '0') || 0;
}

export type RevealRuntime = {
  /** loader 结束后调用，播放带 no-scroll 的元素 */
  flushNoScroll: (immediate?: boolean) => void;
  destroy: () => void;
};

export function initReveals(scope: HTMLElement): RevealRuntime {
  const noScrollPlays: PlayFn[] = [];
  const kills: (() => void)[] = [];
  const domRestores: DomRestore[] = [];

  scope.querySelectorAll<HTMLElement>('[line]').forEach((el) => {
    const restored = hydrateLineRevealDom(el);
    if (restored) domRestores.push(restored);
  });
  scope.querySelectorAll<HTMLElement>('[letter]').forEach((el) => {
    const restored = hydrateLetterRevealDom(el);
    if (restored) domRestores.push(restored);
  });

  const bindAxisReveal = (
    selector: string,
    childSelector: string,
    stagger: number,
    duration: number,
    ease: string,
  ) => {
    scope.querySelectorAll<HTMLElement>(selector).forEach((el) => {
      if (!inScope(scope, el) || el.dataset.revealInit === '1') return;
      const children = el.querySelectorAll<HTMLElement>(childSelector);
      if (!children.length) return;

      el.dataset.revealInit = '1';
      const delay = parseDelay(el);
      const noScroll = el.hasAttribute('no-scroll');

      gsap.set(children, { yPercent: 100 });
      gsap.set(el, { opacity: 1 });

      const play: PlayFn = (immediate = false) => {
        gsap.to(children, {
          yPercent: 0,
          duration: immediate ? 0 : duration,
          ease,
          stagger: immediate ? 0 : stagger,
          delay: immediate ? 0 : delay,
          overwrite: true,
        });
      };

      if (noScroll) {
        noScrollPlays.push(play);
      } else {
        const tween = gsap.to(children, {
          yPercent: 0,
          duration,
          ease,
          stagger,
          delay,
          scrollTrigger: {
            trigger: el,
            start: ST_START,
            toggleActions: 'play none none none',
          },
        });
        kills.push(() => tween.scrollTrigger?.kill());
      }
    });
  };

  bindAxisReveal('[line]', '.line-child', 0.05, 1, 'power4.inOut');
  bindAxisReveal('[letter]', '.letter-child', 0.03, 1.2, 'power4.inOut');

  scope.querySelectorAll<HTMLElement>('[opacity]').forEach((el) => {
    if (!inScope(scope, el) || el.dataset.revealInit === '1') return;
    el.dataset.revealInit = '1';
    const delay = parseDelay(el);
    const noScroll = el.hasAttribute('no-scroll');
    gsap.set(el, { opacity: 0 });

    const play: PlayFn = (immediate = false) => {
      gsap.set(el, { opacity: 0 });
      gsap.to(el, {
        opacity: 1,
        duration: immediate ? 0 : 1,
        ease: 'power3.out',
        delay: immediate ? 0 : delay,
        overwrite: true,
      });
    };

    if (noScroll) noScrollPlays.push(play);
    else {
      const tween = gsap.to(el, {
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        delay,
        scrollTrigger: {
          trigger: el,
          start: ST_START,
          toggleActions: 'play none none none',
        },
      });
      kills.push(() => tween.scrollTrigger?.kill());
    }
  });

  scope.querySelectorAll<HTMLElement>('[scale]').forEach((el) => {
    if (!inScope(scope, el) || el.dataset.revealInit === '1') return;
    el.dataset.revealInit = '1';
    const delay = parseDelay(el);
    const noScroll = el.hasAttribute('no-scroll');
    gsap.set(el, { scale: 0, transformOrigin: '50% 50%' });

    const play: PlayFn = (immediate = false) => {
      gsap.set(el, { scale: 0, opacity: 1 });
      gsap.to(el, {
        scale: 1,
        duration: immediate ? 0 : 1,
        ease: 'power3.out',
        delay: immediate ? 0 : delay,
        overwrite: true,
      });
    };

    if (noScroll) noScrollPlays.push(play);
    else {
      const tween = gsap.to(el, {
        scale: 1,
        duration: 1,
        ease: 'power3.out',
        delay,
        scrollTrigger: {
          trigger: el,
          start: ST_START,
          toggleActions: 'play none none none',
        },
      });
      kills.push(() => tween.scrollTrigger?.kill());
    }
  });

  return {
    flushNoScroll(immediate = false) {
      const batch = [...noScrollPlays];
      noScrollPlays.length = 0;
      batch.forEach((play) => play(immediate));
    },
    destroy() {
      kills.forEach((fn) => fn());
      domRestores.forEach(({ el, html }) => {
        el.innerHTML = html;
      });
      scope.querySelectorAll('[data-reveal-init="1"]').forEach((el) => {
        delete (el as HTMLElement).dataset.revealInit;
      });
    },
  };
}
