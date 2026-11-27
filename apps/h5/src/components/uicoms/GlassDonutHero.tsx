import { useEffect, useRef } from 'react';
import { createGlassDonutScene } from './glass-donut/createGlassDonutScene';
import './GlassDonutHero.css';

export type GlassDonutHeroProps = {
  title?: string;
  subtitle?: string;
  className?: string;
  dprCap?: number;
};

/**
 * 旋转玻璃甜甜圈 + 棱镜色散（参考 Cinema 4D glass donut / Pinterest 教程类效果）
 */
export default function GlassDonutHero({
  title = 'Glass Donut',
  subtitle = 'Spinning torus · transmission · prism dispersion',
  className,
  dprCap = 2,
}: GlassDonutHeroProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<ReturnType<typeof createGlassDonutScene> | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const scene = createGlassDonutScene({ container: host, dprCap });
    sceneRef.current = scene;

    const io = new IntersectionObserver(
      ([entry]) => {
        scene.setPaused(!entry.isIntersecting);
      },
      { rootMargin: '80px 0px', threshold: 0.05 },
    );
    io.observe(host);

    return () => {
      io.disconnect();
      scene.dispose();
      sceneRef.current = null;
    };
  }, [dprCap]);

  const rootClass = ['uicom-glass-donut', className].filter(Boolean).join(' ');

  return (
    <section className={rootClass} aria-label={title}>
      <div ref={hostRef} className="uicom-glass-donut__canvas" aria-hidden />
      <div className="uicom-glass-donut__overlay">
        <h2 className="uicom-glass-donut__title">{title}</h2>
        {subtitle ? <p className="uicom-glass-donut__subtitle">{subtitle}</p> : null}
      </div>
    </section>
  );
}
