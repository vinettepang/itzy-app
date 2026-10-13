import { useEffect, useRef } from 'react';
import { createCrystalScene } from './crystal/createCrystalScene';
import './CrystalHero.css';

export type CrystalHeroProps = {
  title?: string;
  subtitle?: string;
  className?: string;
  /** 限制 DPR，移动端更省性能 */
  dprCap?: number;
};

export default function CrystalHero({
  title = 'Crystal',
  subtitle = 'Transmission glass · abstract crystalline hero',
  className,
  dprCap = 2,
}: CrystalHeroProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<ReturnType<typeof createCrystalScene> | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const scene = createCrystalScene({ container: host, dprCap });
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

  const rootClass = ['uicom-crystal-hero', className].filter(Boolean).join(' ');

  return (
    <section className={rootClass} aria-label={title}>
      <div ref={hostRef} className="uicom-crystal-hero__canvas" aria-hidden />
      <div className="uicom-crystal-hero__overlay">
        <h2 className="uicom-crystal-hero__title">{title}</h2>
        {subtitle ? <p className="uicom-crystal-hero__subtitle">{subtitle}</p> : null}
      </div>
    </section>
  );
}
