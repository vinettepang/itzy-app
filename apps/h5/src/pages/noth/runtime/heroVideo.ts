/** 对应 main `NC`：hero 背景视频自动播放（无 WebGL 遮罩） */
export function initHeroVideo(scope: HTMLElement): () => void {
  const video = scope.querySelector<HTMLVideoElement>('.section-w .video-hero-bg');
  if (!video) return () => {};

  video.muted = true;
  video.defaultMuted = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('muted', '');

  const tryPlay = () => {
    const p = video.play();
    p?.catch?.(() => {});
  };
  tryPlay();
  video.addEventListener('loadeddata', tryPlay, { once: true });
  video.addEventListener('canplay', tryPlay, { once: true });

  return () => {
    video.removeEventListener('loadeddata', tryPlay);
    video.removeEventListener('canplay', tryPlay);
  };
}
