const HERO_SCRIPT_ID = 'noth-hero-webgl';
const HERO_SRC = '/noth/assets/8cae500c5405-main.hero.mjs';

declare global {
  interface Window {
    __nothHeroFluid?: {
      init: () => Promise<void> | void;
      destroy: () => void;
    };
  }
}

let heroLoadPromise: Promise<void> | null = null;

function loadHeroModule(): Promise<void> {
  if (heroLoadPromise) return heroLoadPromise;
  if (window.__nothHeroFluid) {
    heroLoadPromise = Promise.resolve();
    return heroLoadPromise;
  }
  heroLoadPromise = new Promise((resolve, reject) => {
    if (document.getElementById(HERO_SCRIPT_ID)) {
      const wait = () => {
        if (window.__nothHeroFluid) resolve();
        else requestAnimationFrame(wait);
      };
      wait();
      return;
    }
    const el = document.createElement('script');
    el.id = HERO_SCRIPT_ID;
    el.type = 'module';
    el.src = HERO_SRC;
    el.onload = () => {
      if (window.__nothHeroFluid) resolve();
      else reject(new Error('Hero module loaded but __nothHeroFluid missing'));
    };
    el.onerror = () => reject(new Error('Failed to load Noth hero WebGL bundle'));
    document.head.appendChild(el);
  });
  return heroLoadPromise;
}

/**
 * 对应 main `mx`：在 `loader:hero-revealed` 后挂载 WebGL 流体遮罩（不加载整站 main.spa.js）。
 */
export function initHeroWebgl(_scope: HTMLElement): () => void {
  let destroyed = false;

  const onRevealed = () => {
    if (destroyed) return;
    void loadHeroModule()
      .then(() => window.__nothHeroFluid?.init?.())
      .catch((err) => console.warn('[noth] hero WebGL init failed', err));
  };

  window.addEventListener('loader:hero-revealed', onRevealed);

  return () => {
    destroyed = true;
    window.removeEventListener('loader:hero-revealed', onRevealed);
    try {
      window.__nothHeroFluid?.destroy?.();
    } catch {
      /* ignore */
    }
  };
}
