import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** 对应 main `Ev`：桌面端 showreel 视频块 scrub 缩放 */
export function initShowreel(scope: HTMLElement): () => void {
  if (!window.matchMedia('(min-width: 992px)').matches) return () => {};

  const section = scope.querySelector('.section.showreel');
  const box = section?.querySelector('.video-showreel-full-w') as HTMLElement | null;
  if (!section || !box) return () => {};

  const tween = gsap.fromTo(
    box,
    { width: '100%', height: '100%' },
    {
      width: '33.3%',
      height: '35%',
      ease: 'power4.inOut',
      immediateRender: false,
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 3,
        invalidateOnRefresh: true,
      },
    },
  );

  return () => tween.scrollTrigger?.kill();
}
