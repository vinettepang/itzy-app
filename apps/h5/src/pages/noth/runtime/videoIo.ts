/** main `hx` / `fx` / `wC` / `AC` / `CC` — 非 musee 区 autoplay 视频进出视口播放 */

function collectVideos(scope: HTMLElement): HTMLVideoElement[] {
  return [...scope.querySelectorAll<HTMLVideoElement>('video')].filter(
    (v) =>
      !v.closest('.musee-w') &&
      (v.hasAttribute('autoplay') || v.classList.contains('video-hero-bg')),
  );
}

function prepareAutoplayVideo(video: HTMLVideoElement) {
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('muted', '');
}

function tryPlay(video: HTMLVideoElement) {
  const p = video.play();
  p?.catch?.(() => {});
}

export function initVideoIo(scope: HTMLElement): () => void {
  const videos = collectVideos(scope);
  if (!videos.length) return () => {};

  videos.forEach(prepareAutoplayVideo);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target as HTMLVideoElement;
        if (entry.isIntersecting) tryPlay(video);
        else {
          try {
            video.pause();
          } catch {
            /* ignore */
          }
        }
      });
    },
    { threshold: 0 },
  );

  videos.forEach((v) => observer.observe(v));

  return () => {
    observer.disconnect();
    videos.forEach((v) => {
      try {
        v.pause();
      } catch {
        /* ignore */
      }
    });
  };
}
