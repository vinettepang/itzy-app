import { useEffect, useLayoutEffect, useRef } from 'react';
import {
  createPanterVisionScene,
  type PanterBackdrop,
  type PanterMotion,
} from './panter-vision/createPanterVisionScene';
import type { PosterCanvasLayout, PosterDrawOptions } from './panter-vision/drawPosterCanvas';
import './PanterVisionHero.css';

export type PanterVisionHeroProps = {
  className?: string;
  dprCap?: number;
  poster?: Partial<PosterDrawOptions>;
  /** 前景玻璃字，默认 ITZY */
  glassText?: string;
  /** 无障碍标题 */
  title?: string;
  /** 替代黑白海报的背景绘制函数，需保持引用稳定 */
  backdrop?: PanterBackdrop;
  /** stagger：逐字错相摆动（默认）；together：整词一起旋转 */
  motion?: PanterMotion;
  /** 外部强制暂停 WebGL（如菜单叠层打开时减轻合成压力） */
  scenePaused?: boolean;
  /** 背景海报是否铺满容器宽度（默认居中竖版） */
  posterLayout?: PosterCanvasLayout;
  /** 左右黑边比例，如 0.15 = 各 15% */
  posterHorizontalInset?: number;
  /** 背景字版面宽度占比（如 0.75），玻璃字大小不受影响 */
  posterContentWidthRatio?: number;
};

export type { PanterBackdrop, PanterMotion };

/**
 * Panter Vision 风海报：黑白粗体排版 + 3D 玻璃字 S / 扭结折射背景（棱镜色散）
 */
export default function PanterVisionHero({
  className,
  dprCap = 2,
  poster,
  glassText = 'ITZY',
  title = 'Panter Vision glass poster',
  backdrop,
  motion,
  scenePaused = false,
  posterLayout = 'framed',
  posterHorizontalInset = 0,
  posterContentWidthRatio = 0,
}: PanterVisionHeroProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<Awaited<ReturnType<typeof createPanterVisionScene>> | null>(null);
  const pauseRef = useRef({ inView: true, scene: scenePaused });

  const syncPause = () => {
    const { inView, scene } = pauseRef.current;
    handleRef.current?.setPaused(!inView || scene);
  };

  pauseRef.current.scene = scenePaused;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    let io: IntersectionObserver | null = null;

    createPanterVisionScene({
      container: host,
      dprCap,
      poster,
      glassText,
      backdrop,
      motion,
      posterLayout,
      posterHorizontalInset,
      posterContentWidthRatio,
    })
      .then((scene) => {
        if (cancelled) {
          scene.dispose();
          return;
        }
        handleRef.current = scene;
        syncPause();
        io = new IntersectionObserver(
          ([entry]) => {
            pauseRef.current.inView = entry.isIntersecting;
            syncPause();
          },
          { rootMargin: '120px 0px', threshold: 0.01 },
        );
        io.observe(host);
      })
      .catch((err) => {
        console.error('[PanterVisionHero] WebGL scene failed', err);
      });

    return () => {
      cancelled = true;
      io?.disconnect();
      handleRef.current?.dispose();
      handleRef.current = null;
    };
  }, [dprCap, poster, glassText, backdrop, motion, posterLayout, posterHorizontalInset, posterContentWidthRatio]);

  useLayoutEffect(() => {
    syncPause();
  }, [scenePaused]);

  const rootClass = ['uicom-panter-vision', className].filter(Boolean).join(' ');

  return (
    <section className={rootClass} aria-label={title}>
      <div ref={hostRef} className="uicom-panter-vision__stage" />
      <p className="uicom-panter-vision__sr">{title}</p>
    </section>
  );
}
