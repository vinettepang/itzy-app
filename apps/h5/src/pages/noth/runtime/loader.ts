import gsap from 'gsap';
import { runHeroReveal } from './heroReveal';

const STORAGE_KEY = 'nothin:loader-played';
const LOADER_MS = 5000;
const INTERVAL_MIN = 100;
const INTERVAL_MAX = 500;

type LoaderState = {
  imgIndex: number;
  spinTimer: ReturnType<typeof setTimeout> | null;
  counterTween: gsap.core.Tween | null;
  nLoadWrap: HTMLDivElement | null;
  killed: boolean;
};

function loaderPlayed(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function markLoaderPlayed() {
  try {
    sessionStorage.setItem(STORAGE_KEY, '1');
  } catch {
    /* ignore */
  }
}

function spinInterval(elapsed: number) {
  const t = Math.min(elapsed / LOADER_MS, 1);
  return INTERVAL_MIN + (INTERVAL_MAX - INTERVAL_MIN) * (1 - Math.sin(t * Math.PI));
}

function hideLoaderEl(loader: HTMLElement, onHidden: () => void) {
  gsap.to(loader, {
    height: 0,
    duration: 1.8,
    ease: 'power4.inOut',
    onComplete: () => {
      gsap.set(loader, { display: 'none' });
      onHidden();
    },
  });
}

/**
 * 对应 main `vM` → `_M` → `O_` → `gM` → `tf`
 */
export function initNothLoader(scope: HTMLElement, onComplete: () => void): () => void {
  const state: LoaderState = {
    imgIndex: 0,
    spinTimer: null,
    counterTween: null,
    nLoadWrap: null,
    killed: false,
  };

  const loader = scope.querySelector<HTMLElement>('.loader');
  const finish = () => {
    if (state.killed) return;
    void runHeroReveal(scope).then(() => {
      if (!state.killed) onComplete();
    });
  };

  if (!loader) {
    finish();
    return () => {
      state.killed = true;
    };
  }

  if (loaderPlayed()) {
    gsap.set(loader, { display: 'none' });
    finish();
    return () => {
      state.killed = true;
    };
  }

  markLoaderPlayed();

  const nLoad = loader.querySelector<HTMLElement>('.n-load');
  const aposLoad = loader.querySelector<HTMLElement>('.apos-load');
  const images = [...loader.querySelectorAll<HTMLElement>('.loader-img')];
  const imgWrap = loader.querySelector<HTMLElement>('.loader-img-w');
  const counter = loader.querySelector<HTMLElement>('.loader-nbr-w');

  const heroSvg = scope.querySelector('.nothin-hero-svg');
  if (heroSvg) {
    heroSvg.querySelectorAll<SVGPathElement>('path:not(.nothin-apos)').forEach((p) => {
      gsap.set(p, { autoAlpha: 0 });
    });
    const apos = heroSvg.querySelector('.nothin-apos');
    if (apos) gsap.set(apos, { autoAlpha: 0 });
  }

  if (!nLoad || images.length === 0) {
    gsap.set(loader, { display: 'none' });
    finish();
    return () => {
      state.killed = true;
    };
  }

  if (counter) {
    gsap.set(counter, { autoAlpha: 1 });
    counter.textContent = '100';
  }

  const wrap = document.createElement('div');
  wrap.style.cssText = 'overflow:hidden;display:flex;';
  nLoad.parentNode?.insertBefore(wrap, nLoad);
  wrap.appendChild(nLoad);
  state.nLoadWrap = wrap;

  gsap.set(nLoad, { yPercent: 100, opacity: 0 });
  if (aposLoad) gsap.set(aposLoad, { scale: 0, transformOrigin: 'center center' });

  const introDur = 1;
  gsap.to(nLoad, {
    opacity: 1,
    yPercent: 0,
    duration: introDur,
    ease: 'power4.inOut',
    onComplete: () => startCarousel(images, imgWrap, counter, loader, state, finish),
  });
  if (aposLoad) {
    gsap.to(aposLoad, { scale: 1, duration: introDur, ease: 'power4.inOut' });
  }

  return () => {
    state.killed = true;
    if (state.spinTimer) clearTimeout(state.spinTimer);
    state.counterTween?.kill();
    gsap.killTweensOf(loader);
    images.forEach((img) => gsap.killTweensOf(img));
    if (state.nLoadWrap?.parentNode) {
      state.nLoadWrap.parentNode.insertBefore(nLoad, state.nLoadWrap);
      state.nLoadWrap.remove();
    }
  };
}

function startCarousel(
  images: HTMLElement[],
  imgWrap: HTMLElement | null,
  counter: HTMLElement | null,
  loader: HTMLElement,
  state: LoaderState,
  finish: () => void,
) {
  images.forEach((img) => gsap.set(img, { opacity: 0 }));

  const showIndex = state.imgIndex;
  const current = images[showIndex];
  const targetWidth = window.matchMedia('(max-width: 991px)').matches ? '10rem' : '20rem';

  if (imgWrap) {
    gsap.fromTo(imgWrap, { width: '1rem' }, { width: targetWidth, duration: 1.2, ease: 'power4.inOut' });
  }

  gsap.set(current, { opacity: 1, scale: 0 });
  gsap.to(current, {
    scale: 1,
    rotate: 15,
    duration: 0.8,
    ease: 'back.out(0.9)',
    delay: 0.5,
    onComplete: () => {
      startCounter(counter, state);
      scheduleSpin(images, performance.now(), loader, imgWrap, counter, state, finish);
    },
  });
}

function startCounter(counter: HTMLElement | null, state: LoaderState) {
  if (!counter) return;
  const model = { val: 100 };
  counter.textContent = '100';
  state.counterTween = gsap.to(model, {
    val: 0,
    duration: LOADER_MS / 750,
    ease: 'power2.inOut',
    onUpdate: () => {
      counter.textContent = Math.round(model.val).toString().padStart(3, '0');
    },
    onComplete: () => {
      counter.textContent = '000';
    },
  });
}

function scheduleSpin(
  images: HTMLElement[],
  startedAt: number,
  loader: HTMLElement,
  imgWrap: HTMLElement | null,
  counter: HTMLElement | null,
  state: LoaderState,
  finish: () => void,
) {
  if (state.killed) return;
  const elapsed = performance.now() - startedAt;
  if (elapsed >= LOADER_MS) {
    endCarousel(images, loader, imgWrap, counter, state, finish);
    return;
  }

  state.spinTimer = setTimeout(() => {
    if (state.killed) return;
    const prev = images[state.imgIndex];
    gsap.killTweensOf(prev);
    gsap.set(prev, { clearProps: 'all', opacity: 0 });

    state.imgIndex = (state.imgIndex + 1) % images.length;
    const next = images[state.imgIndex];
    gsap.killTweensOf(next);
    gsap.fromTo(
      next,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.32, ease: 'back.out(1.2)' },
    );

    scheduleSpin(images, startedAt, loader, imgWrap, counter, state, finish);
  }, spinInterval(elapsed));
}

function endCarousel(
  images: HTMLElement[],
  loader: HTMLElement,
  imgWrap: HTMLElement | null,
  counter: HTMLElement | null,
  state: LoaderState,
  finish: () => void,
) {
  if (state.killed) return;
  const current = images[state.imgIndex];
  gsap.to(current, { scale: 0, duration: 0.6, ease: 'power4.inOut', delay: 0.5 });

  const collapse = () => {
    if (counter) gsap.to(counter, { autoAlpha: 0, duration: 0.5, ease: 'power4.inOut' });
    hideLoaderEl(loader, finish);
  };

  if (imgWrap) {
    gsap.to(imgWrap, {
      width: '1rem',
      duration: 0.8,
      ease: 'power4.inOut',
      delay: 0.6,
      onComplete: collapse,
    });
  } else {
    collapse();
  }
}
