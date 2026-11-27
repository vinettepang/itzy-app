import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const LETTER_CLIP: Record<string, { x: number; w: number }> = {
  'nav-o': { x: 241, w: 285 },
  'nav-t': { x: 520, w: 183 },
  'nav-h': { x: 722, w: 228 },
  'nav-i': { x: 968, w: 72 },
  'nav-n-last': { x: 1058, w: 230 },
};

const LETTER_KEYS = ['nav-o', 'nav-t', 'nav-h', 'nav-i', 'nav-n-last'] as const;

const VIEW_W_CLOSED = 338;
const VIEW_W_OPEN = 1398;
const APOS_X_CLOSED = -1060;
const LETTER_Y_HIDDEN = 320;

const SVG_NS = 'http://www.w3.org/2000/svg';

function ensureLetterClip(svg: SVGSVGElement, el: Element, key: string) {
  const clipId = `clip-${key}`;
  if (el.parentElement?.getAttribute('clip-path')?.includes(clipId)) return;

  const spec = LETTER_CLIP[key];
  if (!spec) return;

  let defs = svg.querySelector('defs');
  if (!defs) {
    defs = document.createElementNS(SVG_NS, 'defs');
    svg.insertBefore(defs, svg.firstChild);
  }
  if (!defs.querySelector(`#${CSS.escape(clipId)}`)) {
    const clip = document.createElementNS(SVG_NS, 'clipPath');
    clip.setAttribute('id', clipId);
    const rect = document.createElementNS(SVG_NS, 'rect');
    rect.setAttribute('x', String(spec.x));
    rect.setAttribute('y', '0');
    rect.setAttribute('width', String(spec.w));
    rect.setAttribute('height', '291');
    clip.appendChild(rect);
    defs.appendChild(clip);
  }

  const group = document.createElementNS(SVG_NS, 'g');
  group.setAttribute('clip-path', `url(#${clipId})`);
  el.parentNode?.insertBefore(group, el);
  group.appendChild(el);
}

function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

type LogoPhase = 'idle' | 'spacing-in' | 'letters-in' | 'open' | 'letters-out' | 'spacing-out';

/** main `Mv` / `wA` */
export function initNavLogo(scope: HTMLElement): () => void {
  const wrap = scope.querySelector<HTMLElement>('.nav-logo-wrap');
  const svg = wrap?.querySelector<SVGSVGElement>('.nav-logo');
  if (!wrap || !svg) return () => {};

  const apos = svg.querySelector('.nav-apos');
  const letters = LETTER_KEYS.map((key) => svg.querySelector(`.${key}`)).filter(Boolean) as Element[];

  LETTER_KEYS.forEach((key, i) => {
    if (letters[i]) ensureLetterClip(svg, letters[i], key);
  });

  const view = { w: VIEW_W_CLOSED };
  const aposX = { x: APOS_X_CLOSED };

  const syncViewBox = () => {
    svg.setAttribute('viewBox', `0 0 ${view.w.toFixed(1)} 291`);
    apos?.setAttribute('transform', `translate(${aposX.x.toFixed(1)}, 0)`);
  };

  gsap.set(svg, { attr: { viewBox: `0 0 ${VIEW_W_CLOSED} 291` } });
  if (apos) gsap.set(apos, { attr: { transform: `translate(${APOS_X_CLOSED}, 0)` } });
  letters.forEach((el) => {
    gsap.set(el, { attr: { transform: `translate(0, ${LETTER_Y_HIDDEN})` } });
  });

  let phase: LogoPhase = 'idle';
  let spacingTl: gsap.core.Timeline | null = null;
  let lettersTl: gsap.core.Timeline | null = null;

  const killTweens = () => {
    spacingTl?.kill();
    lettersTl?.kill();
    spacingTl = null;
    lettersTl = null;
  };

  const runSpacingIn = () => {
    phase = 'spacing-in';
    const order = shuffle([0, 1, 2, 3, 4]);
    spacingTl = gsap.timeline({
      onUpdate: syncViewBox,
      onComplete: () => {
        phase = 'open';
      },
    });
    spacingTl.to(view, { w: VIEW_W_OPEN, duration: 0.7, ease: 'power4.inOut' }, 0);
    spacingTl.to(aposX, { x: 0, duration: 0.7, ease: 'power4.inOut' }, 0);
    order.forEach((idx, u) => {
      spacingTl!.to(
        letters[idx],
        { attr: { transform: 'translate(0, 0)' }, duration: 0.6, ease: 'power4.inOut' },
        0.35 + u * 0.06,
      );
    });
  };

  const runLettersIn = () => {
    phase = 'letters-in';
    const order = shuffle([0, 1, 2, 3, 4]);
    lettersTl = gsap.timeline({
      onUpdate: syncViewBox,
      onComplete: () => {
        phase = 'open';
      },
    });
    lettersTl.to(view, { w: VIEW_W_OPEN, duration: 0.6, ease: 'power4.inOut' }, 0);
    lettersTl.to(aposX, { x: 0, duration: 0.6, ease: 'power4.inOut' }, 0);
    order.forEach((idx, u) => {
      lettersTl!.to(
        letters[idx],
        { attr: { transform: 'translate(0, 0)' }, duration: 0.6, ease: 'power4.inOut' },
        u * 0.06,
      );
    });
  };

  const runLettersOut = () => {
    phase = 'letters-out';
    const order = shuffle([0, 1, 2, 3, 4]);
    lettersTl = gsap.timeline({ onComplete: runSpacingOut });
    order.forEach((idx, u) => {
      lettersTl!.to(
        letters[idx],
        {
          attr: { transform: `translate(0, ${LETTER_Y_HIDDEN})` },
          duration: 0.6,
          ease: 'power4.inOut',
        },
        u * 0.08,
      );
    });
  };

  const runSpacingOut = () => {
    phase = 'spacing-out';
    spacingTl = gsap.timeline({
      onUpdate: syncViewBox,
      onComplete: () => {
        phase = 'idle';
      },
    });
    spacingTl.to(view, { w: VIEW_W_CLOSED, duration: 0.7, ease: 'power4.inOut' }, 0);
    spacingTl.to(aposX, { x: APOS_X_CLOSED, duration: 0.7, ease: 'power4.inOut' }, 0);
  };

  const onEnter = () => {
    killTweens();
    if (phase === 'idle' || phase === 'spacing-out') runSpacingIn();
    else if (phase === 'letters-out') runLettersIn();
  };

  const onLeave = () => {
    killTweens();
    if (phase === 'open' || phase === 'letters-in' || phase === 'spacing-in') runLettersOut();
  };

  const desktop = !window.matchMedia('(max-width: 991px)').matches;
  if (desktop) {
    wrap.addEventListener('mouseenter', onEnter);
    wrap.addEventListener('mouseleave', onLeave);
  }

  const hasHeroSvg = !!scope.querySelector('.nothin-hero-svg');
  gsap.set(wrap, { autoAlpha: 0 });

  let visSt: ScrollTrigger | null = null;

  if (hasHeroSvg) {
    const setVisible = (show: boolean) => {
      gsap.to(wrap, {
        autoAlpha: show ? 1 : 0,
        duration: show ? 0.4 : 0.3,
        ease: show ? 'power2.out' : 'power2.in',
      });
    };

    const getScrollY = ScrollTrigger.getScrollFunc(window);
    const updateFromScroll = () => {
      const y = getScrollY();
      setVisible(y >= window.innerHeight * 0.1);
    };

    visSt = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: updateFromScroll,
      onRefresh: updateFromScroll,
    });
    updateFromScroll();
  } else {
    gsap.set(wrap, { autoAlpha: 1 });
  }

  return () => {
    if (desktop) {
      wrap.removeEventListener('mouseenter', onEnter);
      wrap.removeEventListener('mouseleave', onLeave);
    }
    visSt?.kill();
    killTweens();
    gsap.killTweensOf(wrap);
    view.w = VIEW_W_CLOSED;
    aposX.x = APOS_X_CLOSED;
    syncViewBox();
    letters.forEach((el) => {
      gsap.set(el, { attr: { transform: `translate(0, ${LETTER_Y_HIDDEN})` } });
    });
    phase = 'idle';
  };
}
