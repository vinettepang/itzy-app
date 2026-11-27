import { ScrollTrigger } from 'gsap/ScrollTrigger';

let refreshTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleRefresh() {
  if (refreshTimer) clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 150);
}

/** 对应 main `_x` / `vx` */
export function initScrollRefresh(scope: HTMLElement): () => void {
  scope.querySelectorAll('img[loading="lazy"]').forEach((img) => {
    (img as HTMLImageElement).loading = 'eager';
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => ScrollTrigger.refresh());
  });

  const onLoad = () => scheduleRefresh();
  scope.querySelectorAll('img').forEach((img) => {
    if (!(img as HTMLImageElement).complete) {
      img.addEventListener('load', onLoad, { once: true });
      img.addEventListener('error', onLoad, { once: true });
    }
  });
  scope.querySelectorAll('video').forEach((video) => {
    if ((video as HTMLVideoElement).readyState < 1) {
      video.addEventListener('loadedmetadata', onLoad, { once: true });
    }
  });

  const fontsDone = document.fonts?.ready?.then(scheduleRefresh);

  return () => {
    if (refreshTimer) clearTimeout(refreshTimer);
    void fontsDone;
  };
}
