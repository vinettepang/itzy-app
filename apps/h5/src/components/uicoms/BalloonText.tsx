import { useEffect, useRef } from 'react';
import { createBalloonTextScene } from './balloon/createBalloonTextScene';
import './BalloonText.css';

export type BalloonTextProps = {
  text?: string;
  /** 箔膜颜色 */
  color?: string;
  className?: string;
  dprCap?: number;
};

export default function BalloonText({
  text = 'allinus',
  color = '#2448c8',
  className,
  dprCap = 2,
}: BalloonTextProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const scene = createBalloonTextScene({ container: host, text, color, dprCap });
    const io = new IntersectionObserver(([entry]) => scene.setPaused(!entry.isIntersecting), {
      rootMargin: '80px 0px',
      threshold: 0.05,
    });
    io.observe(host);

    return () => {
      io.disconnect();
      scene.dispose();
    };
  }, [text, color, dprCap]);

  const rootClass = ['uicom-balloon-text', className].filter(Boolean).join(' ');

  return (
    <section className={rootClass} aria-label={text}>
      <div ref={hostRef} className="uicom-balloon-text__canvas" aria-hidden />
    </section>
  );
}
