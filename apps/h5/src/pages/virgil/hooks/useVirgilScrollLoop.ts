import { type RefObject, useEffect, useRef } from 'react';

function viewportHeight(): number {
  const mobile = window.innerWidth <= 700;
  if (mobile) {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--initial-vh');
    const parsed = parseFloat(raw);
    return parsed > 0 ? parsed : window.innerHeight;
  }
  return window.innerHeight;
}

type Options = {
  contentRef: RefObject<HTMLElement | null>;
  rightBlockRef: RefObject<HTMLElement | null>;
  announcementRef: RefObject<HTMLElement | null>;
  resetTrigger: number;
  cyclingRef: RefObject<boolean>;
  onBottomCycle: () => Promise<void>;
};

/**
 * 还原生产站 et() 滚动逻辑：
 * - 证书阶段后内容区继续 translateY 上移
 * - ANNOUNCEMENT 淡出
 * - 滚到底 → 淡入淡出换肤循环
 */
export function useVirgilScrollLoop({
  contentRef,
  rightBlockRef,
  announcementRef,
  resetTrigger,
  cyclingRef,
  onBottomCycle,
}: Options) {
  const bottomArmedRef = useRef(false);
  const resetTriggerRef = useRef(resetTrigger);
  const onBottomCycleRef = useRef(onBottomCycle);

  resetTriggerRef.current = resetTrigger;
  onBottomCycleRef.current = onBottomCycle;

  useEffect(() => {
    let raf = 0;

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;

        if (cyclingRef.current) return;

        const content = contentRef.current;
        const right = rightBlockRef.current;
        const announcement = announcementRef.current;
        if (!content) return;

        const mobile = window.innerWidth <= 700;
        const vh = viewportHeight();
        const scrollY = window.scrollY;
        const scrollOffset = 0;
        const adjustedY =
          resetTriggerRef.current > 0
            ? Math.max(0, scrollY - scrollOffset)
            : scrollY;
        const maxScroll = document.documentElement.scrollHeight - vh;
        const parallaxStart = ((mobile ? 130 : 160) / 100) * vh;
        const announcementRange = 0.5 * vh;

        if (scrollY < maxScroll - 200) {
          bottomArmedRef.current = false;
        }

        if (maxScroll > 0 && scrollY >= maxScroll - 5 && !bottomArmedRef.current) {
          bottomArmedRef.current = true;
          void onBottomCycleRef.current();
          return;
        }

        content.style.opacity = '1';
        const offsetY = adjustedY <= parallaxStart ? 0 : -(adjustedY - parallaxStart);
        content.style.transform = `translateY(${offsetY}px)`;

        if (right) {
          right.style.transform = mobile ? '' : `translateY(${-0.25 * offsetY}px)`;
        }

        if (!mobile && announcement) {
          announcement.style.transition = 'none';
          const u = Math.min(1, Math.max(0, (adjustedY - parallaxStart) / announcementRange));
          const shiftX = -0.13 * window.innerWidth * u;
          announcement.style.transform =
            u === 0 ? '' : `translateY(${shiftX}px) rotate(${-2 * u}deg)`;
          announcement.style.opacity = String(1 - 0.8 * u);
        }
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, [announcementRef, contentRef, cyclingRef, rightBlockRef]);
}
