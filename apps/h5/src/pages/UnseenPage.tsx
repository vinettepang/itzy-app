import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import {
  UNSEEN_LETTERS,
  UNSEEN_MONOLITHS,
  UNSEEN_TILES,
} from '@/pages/unseen/unseenWorldData';
import { useUnseenDrag } from '@/pages/unseen/useUnseenDrag';
import './UnseenPage.css';

type Phase = 'loading' | 'enter' | 'world';

const TAGLINE =
  'A fan archive studio crafting refreshingly bold visuals and cheer moments that help MIDZY cut through the noise.';

export default function UnseenPage() {
  const [phase, setPhase] = useState<Phase>('loading');
  const [progress, setProgress] = useState(0);
  const gateRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<HTMLDivElement>(null);
  const pan = useUnseenDrag(worldRef, phase === 'world');

  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const duration = 2200;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setProgress(Math.round(t * 100));
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setPhase('enter');
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const chars = lettersRef.current?.querySelectorAll('.unseen-letter');
    if (!chars?.length) return;

    gsap.fromTo(
      chars,
      { y: 80, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.1,
        ease: 'power3.out',
        stagger: 0.08,
      },
    );
  }, []);

  function enterWorld() {
    if (phase !== 'enter' || !gateRef.current || !worldRef.current) return;

    const tl = gsap.timeline();
    tl.to(gateRef.current, {
      opacity: 0,
      y: -24,
      duration: 0.85,
      ease: 'power2.inOut',
    }).to(
      worldRef.current,
      {
        opacity: 1,
        duration: 0.85,
        ease: 'power2.out',
      },
      0.15,
    ).call(() => setPhase('world'));
  }

  const showGate = phase === 'loading' || phase === 'enter';

  return (
    <div className="unseen-page">
      {showGate ? (
        <div className="unseen-gate" ref={gateRef}>
          <div className="unseen-gate__letters" ref={lettersRef}>
            {UNSEEN_LETTERS.map((ch) => (
              <span key={ch} className="unseen-letter">
                {ch}
              </span>
            ))}
          </div>

          <p className="unseen-gate__brand">ITZY Archive®</p>

          {phase === 'loading' ? (
            <p className="unseen-gate__status">(Loading) {progress}%</p>
          ) : (
            <>
              <p className="unseen-gate__tagline">{TAGLINE}</p>
              <div className="unseen-gate__actions">
                <button type="button" className="unseen-btn" onClick={enterWorld}>
                  Enter
                </button>
                <button
                  type="button"
                  className="unseen-btn unseen-btn--ghost"
                  onClick={enterWorld}
                >
                  Enter without audio
                </button>
              </div>
            </>
          )}
        </div>
      ) : null}

      <div
        className={`unseen-world ${phase === 'world' ? 'is-active' : ''}`}
        ref={worldRef}
      >
        <div
          className="unseen-world__stage"
          style={{ transform: `translate3d(${pan.x}px, ${pan.y}px, 0)` }}
        >
          {UNSEEN_MONOLITHS.map((mono, i) => (
            <div
              key={i}
              className="unseen-monolith"
              style={{
                left: `calc(50% + ${mono.x}px)`,
                top: `calc(50% + ${mono.y}px)`,
                transform: `translate(-50%, -50%) scale(${mono.scale})`,
              }}
            >
              {UNSEEN_LETTERS.map((ch) => (
                <span key={ch} className="unseen-monolith__char">
                  {ch}
                </span>
              ))}
            </div>
          ))}

          {UNSEEN_TILES.map((tile) => {
            const parallaxX = pan.x * (1 - tile.depth) * 0.12;
            const parallaxY = pan.y * (1 - tile.depth) * 0.12;
            return (
              <figure
                key={tile.id}
                className="unseen-tile"
                style={{
                  left: `calc(50% + ${tile.x - parallaxX}px)`,
                  top: `calc(50% + ${tile.y - parallaxY}px)`,
                  width: tile.w,
                  zIndex: Math.round(tile.depth * 10),
                  transform: `translate(-50%, -50%) rotate(${tile.rotate}deg)`,
                }}
              >
                <img src={tile.src} alt={tile.label} draggable={false} />
                <figcaption>{tile.label}</figcaption>
              </figure>
            );
          })}
        </div>

        <header className="unseen-hud">
          <span className="unseen-hud__brand">ITZY Archive®</span>
          <nav className="unseen-hud__nav">
            <Link to="/">Index</Link>
            <Link to="/songs">Songs</Link>
            <Link to="/schedules">Tour</Link>
          </nav>
        </header>

        <p className="unseen-hint">Drag to explore our world</p>
        <p className="unseen-hint unseen-hint--hold">Click &amp; Hold</p>
        <span className="unseen-copy">©2026</span>
      </div>
    </div>
  );
}
