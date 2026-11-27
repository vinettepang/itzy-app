import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const WHEEL_DISTANCE = 2600;
const TOUCH_SCALE = 2.5;
const FILL_SMOOTH = 0.12;
const BOTTOM_SLACK = 2;

/** main `Qv` / `lC` — case 页底「滚轮填满时间轴 → 跳转下一项」 */
export function initTimelineNext(scope: HTMLElement): () => void {
  const wrap = scope.querySelector<HTMLElement>('.timeline-next-w');
  const fill = wrap?.querySelector<HTMLElement>('.timeline-fill');
  if (!wrap || !fill) return () => {};

  gsap.set(fill, { width: '0%' });

  let target = 0;
  let display = 0;
  let locked = false;
  let touchY: number | null = null;
  let raf: number | null = null;

  const getScrollY = ScrollTrigger.getScrollFunc(window);

  const atPageBottom = () => {
    const max = ScrollTrigger.maxScroll(window);
    return getScrollY() >= max - BOTTOM_SLACK;
  };

  const goNext = () => {
    const link = scope.querySelector<HTMLAnchorElement>('.next-work-link');
    const href = link?.getAttribute('href');
    if (!href || href === '#') return;
    link.click();
  };

  const tick = () => {
    display += (target - display) * FILL_SMOOTH;
    if (Math.abs(target - display) < 0.0005) display = target;
    gsap.set(fill, { width: `${display * 100}%` });
    if (!locked && display >= 0.999) {
      locked = true;
      raf = null;
      goNext();
      return;
    }
    if (display !== target) raf = requestAnimationFrame(tick);
    else raf = null;
  };

  const scheduleTick = () => {
    if (!raf) raf = requestAnimationFrame(tick);
  };

  const blockEvent = (e: Event) => {
    if (!e.cancelable) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation?.();
  };

  const applyDelta = (delta: number, e: Event) => {
    if (delta > 0) {
      if (!atPageBottom()) return;
      target = Math.min(1, target + delta / WHEEL_DISTANCE);
      blockEvent(e);
      scheduleTick();
    } else if (delta < 0) {
      if (target <= 0) return;
      target = Math.max(0, target + delta / WHEEL_DISTANCE);
      blockEvent(e);
      scheduleTick();
    }
  };

  const onWheel = (e: WheelEvent) => {
    if (locked) return;
    applyDelta(e.deltaY, e);
  };

  const onTouchStart = (e: TouchEvent) => {
    touchY = e.touches[0]?.clientY ?? null;
  };

  const onTouchMove = (e: TouchEvent) => {
    if (locked || touchY == null) return;
    const y = e.touches[0]?.clientY ?? touchY;
    const delta = (touchY - y) * TOUCH_SCALE;
    touchY = y;
    applyDelta(delta, e);
  };

  window.addEventListener('wheel', onWheel, { passive: false, capture: true });
  window.addEventListener('touchstart', onTouchStart, { passive: true, capture: true });
  window.addEventListener('touchmove', onTouchMove, { passive: false, capture: true });

  return () => {
    window.removeEventListener('wheel', onWheel, { capture: true });
    window.removeEventListener('touchstart', onTouchStart, { capture: true });
    window.removeEventListener('touchmove', onTouchMove, { capture: true });
    if (raf) cancelAnimationFrame(raf);
    gsap.set(fill, { clearProps: 'width' });
  };
}
