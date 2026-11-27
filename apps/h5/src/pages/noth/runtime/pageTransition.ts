import gsap from 'gsap';
import type { NavigateFunction } from 'react-router-dom';

function shouldUseFlipTransition(anchor: HTMLAnchorElement, href: string): boolean {
  if (anchor.dataset.transition === 'flip') return true;
  return anchor.classList.contains('work-link') && /\/noth\/works\/[^/]+/.test(href);
}

function findWorkThumb(anchor: HTMLAnchorElement): HTMLImageElement | null {
  return anchor.querySelector<HTMLImageElement>('.img-work-w img, .img-work img');
}

async function gsapFlipNavigate(
  navigate: NavigateFunction,
  href: string,
  anchor: HTMLAnchorElement,
) {
  const img = findWorkThumb(anchor);
  if (!img) {
    navigate(href);
    return;
  }

  const rect = img.getBoundingClientRect();
  const clone = img.cloneNode(true) as HTMLImageElement;
  Object.assign(clone.style, {
    position: 'fixed',
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    zIndex: '10000',
    objectFit: 'cover',
    pointerEvents: 'none',
  });
  document.body.appendChild(clone);

  await gsap.to(clone, {
    top: 0,
    left: 0,
    width: window.innerWidth,
    height: window.innerHeight,
    duration: 0.65,
    ease: 'power4.inOut',
  });
  navigate(href);
  await gsap.to(clone, { opacity: 0, duration: 0.35, ease: 'power2.out' });
  clone.remove();
}

/** Taxi `flip` 的轻量替代：View Transitions 或 GSAP 缩略图全屏 */
export function navigateWithNothTransition(
  navigate: NavigateFunction,
  href: string,
  anchor: HTMLAnchorElement,
) {
  if (!shouldUseFlipTransition(anchor, href)) {
    navigate(href);
    return;
  }

  const startVt = (document as Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } })
    .startViewTransition;

  if (typeof startVt === 'function') {
    startVt(() => {
      navigate(href);
    })?.finished?.catch(() => navigate(href));
    return;
  }

  void gsapFlipNavigate(navigate, href, anchor);
}
