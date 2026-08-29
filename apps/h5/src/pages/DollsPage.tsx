import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { UNSEEN_LETTERS, UNSEEN_MONOLITHS } from '@/pages/unseen/unseenWorldData';
import {
  UNSEEN_MERCH_LAYOUT,
  UNSEEN_OVERVIEW_SCALE,
} from '@/pages/unseen/buildDollGallery';
import { fetchDollGallery, getDollById } from '@/pages/unseen/fetchDollCatalog';
import type { UnseenDoll } from '@/types/dollCatalog';
import { useUnseenDrag } from '@/pages/unseen/useUnseenDrag';
import './DollsPage.css';

const GALLERY_SECTIONS = [
  { key: 'twinzy', title: 'TWINZY', match: /twinzy/i },
  { key: 'wdzy', title: 'WDZY', match: /wdzy/i },
] as const;

type Phase = 'loading' | 'gallery' | 'world';

function focusPanForDoll(doll: UnseenDoll) {
  return { x: -doll.worldX, y: -doll.worldY };
}

export default function DollsPage() {
  const [phase, setPhase] = useState<Phase>('loading');
  const [progress, setProgress] = useState(0);
  const [selectedDollId, setSelectedDollId] = useState<string | null>(null);
  const [overviewMode, setOverviewMode] = useState(false);
  const [worldScale, setWorldScale] = useState(1);
  const [detailDoll, setDetailDoll] = useState<UnseenDoll | null>(null);
  const [dolls, setDolls] = useState<UnseenDoll[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const gateRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const transitionRef = useRef<gsap.core.Timeline | null>(null);
  const [worldSession, setWorldSession] = useState(0);
  const { pan, resetPan } = useUnseenDrag(
    stageRef,
    phase === 'world' && !detailDoll,
    worldSession,
  );

  const selectedDoll = selectedDollId ? getDollById(dolls, selectedDollId) : null;
  const visibleDolls = overviewMode ? dolls : selectedDoll ? [selectedDoll] : [];

  const gallerySections = useMemo(() => {
    return GALLERY_SECTIONS.map((section) => ({
      ...section,
      dolls: dolls
        .filter(
          (doll) =>
            section.match.test(doll.series) ||
            section.match.test(doll.collection) ||
            doll.id.startsWith(`${section.key}-`),
        )
        .slice(0, 5),
    })).filter((section) => section.dolls.length > 0);
  }, [dolls]);

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

    const catalogPromise = fetchDollGallery()
      .then((res) => {
        if (cancelled) return;
        if (res.code !== 0) {
          setLoadError(res.message || '加载失败');
          return;
        }
        setDolls(res.data.dolls);
        setLoadError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : '加载失败');
      });

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setProgress(Math.round(t * 100));
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        Promise.resolve(catalogPromise).then(() => {
          if (!cancelled) setPhase('gallery');
        });
      }
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (phase !== 'gallery' || !gateRef.current) return;

    const headings = gateRef.current.querySelectorAll('.unseen-gallery__heading');
    const items = gateRef.current.querySelectorAll('.unseen-gallery__item');
    if (!items.length) return;

    if (headings.length) {
      gsap.fromTo(
        headings,
        { y: 16, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.55,
          ease: 'power3.out',
          stagger: 0.12,
        },
      );
    }

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
  }, [phase, gallerySections]);

  function enterWorld(dollId: string) {
    if (phase !== 'gallery' || !gateRef.current || !worldRef.current) return;

    const doll = getDollById(dolls, dollId);
    if (!doll) return;

    transitionRef.current?.kill();

    setSelectedDollId(dollId);
    setOverviewMode(false);
    setWorldScale(1);
    setDetailDoll(null);
    setWorldSession((n) => n + 1);
    setPhase('world');

    const focus = focusPanForDoll(doll);
    resetPan(focus.x, focus.y);

    const tl = gsap.timeline();
    transitionRef.current = tl;
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
    ).eventCallback('onComplete', () => {
      transitionRef.current = null;
    });
  }

  function backToGallery() {
    if (phase !== 'world' || !gateRef.current || !worldRef.current) return;

    transitionRef.current?.kill();

    setPhase('gallery');
    setOverviewMode(false);
    setWorldScale(1);
    setDetailDoll(null);

    const tl = gsap.timeline();
    transitionRef.current = tl;
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
    ).eventCallback('onComplete', () => {
      transitionRef.current = null;
      if (worldRef.current) {
        gsap.set(worldRef.current, { clearProps: 'opacity' });
      }
      if (gateRef.current) {
        gsap.set(gateRef.current, { clearProps: 'opacity,transform' });
      }
    });
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
        ) : loadError ? (
          <p className="unseen-gate__status">{loadError}</p>
        ) : (
          <div className="unseen-gallery" aria-label="Doll collection">
            {gallerySections.map((section) => (
              <section
                key={section.key}
                className="unseen-gallery__section"
                aria-labelledby={`unseen-gallery-${section.key}`}
              >
                <h2
                  id={`unseen-gallery-${section.key}`}
                  className="unseen-gallery__heading"
                >
                  {section.title}
                </h2>
                <div className="unseen-gallery__grid">
                  {section.dolls.map((doll) => (
                    <button
                      key={doll.id}
                      type="button"
                      className="unseen-gallery__item"
                      onClick={() => enterWorld(doll.id)}
                    >
                      <img
                        className="unseen-gallery__img"
                        src={doll.src}
                        alt={`${doll.characterName} ${doll.series}`}
                        draggable={false}
                      />
                      <span className="unseen-gallery__label">
                        {doll.characterName}
                      </span>
                      <span className="unseen-gallery__sub">
                        {doll.name} · {doll.productName}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
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
              {overviewMode ? (
                <button
                  type="button"
                  className="unseen-doll-cluster__title unseen-doll-cluster__title--btn"
                  data-no-drag
                  onClick={() => focusDollFromOverview(doll)}
                >
                  {doll.characterName}
                </button>
              ) : (
                <h3
                  className="unseen-doll-cluster__title unseen-doll-cluster__title--float"
                  style={{
                    ['--float-duration' as string]: '7.4s',
                    ['--float-delay' as string]: `${doll.id.length * 0.06}s`,
                  }}
                >
                  {doll.characterName}
                </h3>
              )}

              {doll.merch.map((item, index) => {
                const layout = UNSEEN_MERCH_LAYOUT[index % UNSEEN_MERCH_LAYOUT.length];
                const floatDuration = 6.2 + (index % 4) * 0.9;
                const floatDelay = index * 0.55 + doll.id.length * 0.04;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className="unseen-merch unseen-merch--float"
                    data-no-drag
                    style={{
                      left: layout.x,
                      top: layout.y,
                      ['--float-duration' as string]: `${floatDuration}s`,
                      ['--float-delay' as string]: `${floatDelay}s`,
                    }}
                    onClick={() => openDollDetail(doll)}
                  >
                    <img src={item.src} alt={item.label} draggable={false} />
                    <span className="unseen-merch__label">{item.label}</span>
                    {item.model ? (
                      <span className="unseen-merch__model">{item.model}</span>
                    ) : null}
                  </button>
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
          <p className="unseen-hint unseen-hint--hold">Tap item for details</p>
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
              {detailDoll.characterName} · {detailDoll.series}
            </h2>
            <dl className="unseen-modal__meta">
              <div>
                <dt>Member</dt>
                <dd>{detailDoll.name}</dd>
              </div>
              <div>
                <dt>Character</dt>
                <dd>{detailDoll.characterName}</dd>
              </div>
              <div>
                <dt>Collection</dt>
                <dd>{detailDoll.collection}</dd>
              </div>
              <div>
                <dt>Year</dt>
                <dd>{detailDoll.year}</dd>
              </div>
              <div>
                <dt>Product</dt>
                <dd>{detailDoll.productName}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{detailDoll.status}</dd>
              </div>
            </dl>
            <p className="unseen-modal__source">{detailDoll.officialSource}</p>
            <p className="unseen-modal__desc">{detailDoll.description}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
