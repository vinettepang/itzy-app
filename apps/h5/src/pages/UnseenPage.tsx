import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { UNSEEN_LETTERS, UNSEEN_MONOLITHS } from '@/pages/unseen/unseenWorldData';
import {
  getDollById,
  UNSEEN_DOLLS,
  UNSEEN_MERCH_LAYOUT,
  UNSEEN_OVERVIEW_SCALE,
  type UnseenDoll,
} from '@/pages/unseen/unseenDollData';
import { useUnseenDrag } from '@/pages/unseen/useUnseenDrag';
import './UnseenPage.css';

type Phase = 'loading' | 'gallery' | 'world';

function focusPanForDoll(doll: UnseenDoll) {
  return { x: -doll.worldX, y: -doll.worldY };
}

export default function UnseenPage() {
  const [phase, setPhase] = useState<Phase>('loading');
  const [progress, setProgress] = useState(0);
  const [selectedDollId, setSelectedDollId] = useState<string | null>(null);
  const [overviewMode, setOverviewMode] = useState(false);
  const [worldScale, setWorldScale] = useState(1);
  const [detailDoll, setDetailDoll] = useState<UnseenDoll | null>(null);
  const gateRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const { pan, resetPan } = useUnseenDrag(stageRef, phase === 'world' && !detailDoll);

  const selectedDoll = selectedDollId ? getDollById(selectedDollId) : null;
  const visibleDolls = overviewMode ? UNSEEN_DOLLS : selectedDoll ? [selectedDoll] : [];

  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let frame = 0;
    const start = performance.now();
    const duration = 1600;

    const preload = UNSEEN_DOLLS.map(
      (doll) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = doll.src;
        }),
    );

    Promise.all(preload).then(() => {
      if (cancelled) return;

      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        setProgress(Math.round(t * 100));
        if (t < 1) {
          frame = requestAnimationFrame(tick);
        } else {
          setPhase('gallery');
        }
      };

      frame = requestAnimationFrame(tick);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (phase !== 'gallery' || !gateRef.current) return;

    const items = gateRef.current.querySelectorAll('.unseen-gallery__item');
    if (!items.length) return;

    gsap.fromTo(
      items,
      { y: 28, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.75,
        ease: 'power3.out',
        stagger: 0.06,
      },
    );
  }, [phase]);

  function enterWorld(dollId: string) {
    if (phase !== 'gallery' || !gateRef.current || !worldRef.current) return;

    const doll = getDollById(dollId);
    if (!doll) return;

    setSelectedDollId(dollId);
    setOverviewMode(false);
    setWorldScale(1);
    setDetailDoll(null);

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
    ).call(() => {
      setPhase('world');
      const focus = focusPanForDoll(doll);
      resetPan(focus.x, focus.y);
    });
  }

  function backToGallery() {
    if (phase !== 'world' || !gateRef.current || !worldRef.current) return;

    setPhase('gallery');
    setOverviewMode(false);
    setWorldScale(1);
    setDetailDoll(null);

    const tl = gsap.timeline();
    tl.to(worldRef.current, {
      opacity: 0,
      duration: 0.85,
      ease: 'power2.inOut',
    }).fromTo(
      gateRef.current,
      { opacity: 0, y: -24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: 'power2.out',
      },
      0.15,
    );
  }

  function toggleOverview() {
    if (!selectedDoll) return;

    if (overviewMode) {
      setOverviewMode(false);
      setWorldScale(1);
      const focus = focusPanForDoll(selectedDoll);
      resetPan(focus.x, focus.y);
      return;
    }

    setOverviewMode(true);
    setWorldScale(UNSEEN_OVERVIEW_SCALE);
    resetPan(0, 0);
  }

  function openDollDetail(doll: UnseenDoll) {
    setDetailDoll(doll);
  }

  function focusDollFromOverview(doll: UnseenDoll) {
    setSelectedDollId(doll.id);
    setOverviewMode(false);
    setWorldScale(1);
    const focus = focusPanForDoll(doll);
    resetPan(focus.x, focus.y);
  }

  const gateInteractive = phase === 'loading' || phase === 'gallery';

  return (
    <div className="unseen-page">
      <div
        className={`unseen-gate ${gateInteractive ? '' : 'unseen-gate--hidden'}`}
        ref={gateRef}
        aria-hidden={!gateInteractive}
      >
        {phase === 'loading' ? (
          <p className="unseen-gate__status">(Loading) {progress}%</p>
        ) : (
          <div className="unseen-gallery" aria-label="Doll collection">
            {UNSEEN_DOLLS.map((doll) => (
              <button
                key={doll.id}
                type="button"
                className="unseen-gallery__item"
                onClick={() => enterWorld(doll.id)}
              >
                <img
                  className="unseen-gallery__img"
                  src={doll.src}
                  alt={`${doll.name} ${doll.series}`}
                  draggable={false}
                />
                <span className="unseen-gallery__label">
                  {doll.name} · {doll.series}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        className={`unseen-world ${phase === 'world' ? 'is-active' : ''}`}
        ref={worldRef}
      >
        <div
          className="unseen-world__stage"
          ref={stageRef}
          style={{
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${worldScale})`,
          }}
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

          {visibleDolls.map((doll) => (
            <div
              key={doll.id}
              className="unseen-doll-cluster"
              style={{
                left: `calc(50% + ${doll.worldX}px)`,
                top: `calc(50% + ${doll.worldY}px)`,
              }}
            >
              <button
                type="button"
                className="unseen-doll-hero"
                data-no-drag
                onClick={() => {
                  if (overviewMode) {
                    focusDollFromOverview(doll);
                    return;
                  }
                  openDollDetail(doll);
                }}
              >
                <img src={doll.src} alt={`${doll.name} ${doll.series}`} draggable={false} />
                <span className="unseen-doll-hero__label">
                  {doll.name} · {doll.series}
                </span>
              </button>

              {doll.merch.map((item, index) => {
                const layout = UNSEEN_MERCH_LAYOUT[index % UNSEEN_MERCH_LAYOUT.length];
                return (
                  <figure
                    key={item.id}
                    className="unseen-merch"
                    data-no-drag
                    style={{
                      left: layout.x,
                      top: layout.y,
                    }}
                  >
                    <img src={item.src} alt={item.label} draggable={false} />
                    <figcaption>{item.label}</figcaption>
                  </figure>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {phase === 'world' ? (
        <button
          type="button"
          className="unseen-back-btn unseen-back-btn--solo"
          onClick={backToGallery}
        >
          ← Gallery
        </button>
      ) : null}

      {phase === 'world' ? (
        <button
          type="button"
          className={`unseen-overview-btn ${overviewMode ? 'is-active' : ''}`}
          onClick={toggleOverview}
        >
          {overviewMode ? 'Focus' : 'All Dolls'}
        </button>
      ) : null}

      {phase === 'world' && !overviewMode ? (
        <>
          <p className="unseen-hint">Drag to explore merchandise</p>
          <p className="unseen-hint unseen-hint--hold">Tap doll for details</p>
        </>
      ) : null}

      {phase === 'world' && overviewMode ? (
        <p className="unseen-hint">Overview — tap a doll to focus</p>
      ) : null}

      {phase === 'world' ? (
        <span className="unseen-copy">©2026</span>
      ) : null}

      {detailDoll ? (
        <div
          className="unseen-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="unseen-modal-title"
          onClick={() => setDetailDoll(null)}
        >
          <div
            className="unseen-modal__panel"
            data-no-drag
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="unseen-modal__close"
              onClick={() => setDetailDoll(null)}
              aria-label="Close"
            >
              ×
            </button>
            <img
              className="unseen-modal__img"
              src={detailDoll.src}
              alt={`${detailDoll.name} ${detailDoll.series}`}
            />
            <h2 id="unseen-modal-title" className="unseen-modal__title">
              {detailDoll.name} · {detailDoll.series}
            </h2>
            <dl className="unseen-modal__meta">
              <div>
                <dt>Member</dt>
                <dd>{detailDoll.name}</dd>
              </div>
              <div>
                <dt>Series</dt>
                <dd>{detailDoll.series}</dd>
              </div>
              <div>
                <dt>Tour Cycle</dt>
                <dd>{detailDoll.tourCycle}</dd>
              </div>
              <div>
                <dt>Size</dt>
                <dd>{detailDoll.size}</dd>
              </div>
            </dl>
            <p className="unseen-modal__desc">{detailDoll.description}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
