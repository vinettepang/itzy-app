import gsap from 'gsap';

/** 对应 main `tf`：loader 结束后 hero 字标揭示 + 自定义事件（WebGL 在 P3 监听） */
export function runHeroReveal(scope: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    const svg = scope.querySelector('.nothin-hero-svg');
    const paths = svg
      ? [...svg.querySelectorAll<SVGPathElement>('path:not(.nothin-apos)')]
      : [];
    const apos = svg?.querySelector<SVGPathElement>('.nothin-apos') ?? null;

    const nLoad = scope.querySelector('.n-load');
    const aposLoad = scope.querySelector('.apos-load');

    window.dispatchEvent(new CustomEvent('loader:hero-reveal-start'));

    if (nLoad) {
      gsap.to(nLoad, {
        yPercent: 100,
        duration: 1,
        ease: 'power4.inOut',
        onComplete: () => gsap.set(nLoad, { opacity: 0 }),
      });
    }
    if (aposLoad) {
      gsap.to(aposLoad, {
        scale: 0,
        duration: 1,
        ease: 'power4.inOut',
        onComplete: () => gsap.set(aposLoad, { opacity: 0 }),
      });
    }

    const finish = () => {
      window.dispatchEvent(new CustomEvent('loader:hero-revealed'));
      resolve();
    };

    if (paths.length) {
      const order = paths.slice().sort(() => Math.random() - 0.5);
      gsap.fromTo(
        order,
        { autoAlpha: 1, yPercent: 120 },
        {
          yPercent: 0,
          duration: 1.8,
          ease: 'power4.inOut',
          stagger: 0.07,
          delay: 0.2,
          onComplete: finish,
        },
      );
    } else {
      finish();
    }

    if (apos) {
      gsap.fromTo(
        apos,
        { autoAlpha: 1, scale: 0, transformOrigin: 'center center' },
        { scale: 1, duration: 0.6, ease: 'back.out(0.9)', delay: 1.5 },
      );
    }
  });
}
