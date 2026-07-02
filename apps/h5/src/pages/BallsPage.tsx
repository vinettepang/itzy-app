import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { initBallsWorld } from '@/pages/balls/initBallsWorld';
import './BallsPage.css';

export default function BallsPage() {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    initBallsWorld(stage).then((dispose) => {
      if (cancelled) {
        dispose?.();
        return;
      }
      cleanup = dispose;
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return (
    <div className="balls-page">
      <header className="balls-page__header">
        <Link to="/" className="balls-page__back">
          ← Home
        </Link>
        <span className="balls-page__title">Sphere Fall</span>
      </header>

      <div className="balls-page__stage" ref={stageRef} aria-label="Falling spheres" />

      <p className="balls-page__hint">悬停可抓取，拖拽后松手丢出去；快速划过可拨动</p>
    </div>
  );
}
