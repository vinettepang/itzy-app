import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { UNSEEN_LETTERS, UNSEEN_MONOLITHS } from '@/pages/unseen/unseenWorldData';
import { UNSEEN_OVERVIEW_SCALE } from '@/pages/unseen/buildDollGallery';
import { fetchDollGallery, getDollById } from '@/pages/unseen/fetchDollCatalog';
import type { UnseenDoll, DollMerch } from '@/types/dollCatalog';
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
  const [detailMerch, setDetailMerch] = useState<DollMerch | null>(null);
  const [arranged, setArranged] = useState(false);
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
    setArranged(false);
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
    setArranged(false);

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

    setArranged(false);

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

  function openDollDetail(doll: UnseenDoll, merch?: DollMerch) {
    setDetailDoll(doll);
    setDetailMerch(merch ?? null);
  }

  function focusDollFromOverview(doll: UnseenDoll) {
    setSelectedDollId(doll.id);
    setOverviewMode(false);
    setWorldScale(1);
    setArranged(false);
    const focus = focusPanForDoll(doll);
    resetPan(focus.x, focus.y);
  }

  // 混乱（螺旋）→ 整齐（按系列分排）：切换状态，卡片 left/top 由 CSS transition 平滑过渡，再次点击还原
  function toggleArrange() {
    if (!selectedDoll || overviewMode) return;

    const next = !arranged;
    // 排列时把镜头拉回该娃娃中心，确保看清整齐布局
    if (next) resetPan(-selectedDoll.worldX, -selectedDoll.worldY);
    setArranged(next);
  }

  // 当前选中娃娃按系列分组后的标签位置（仅整齐模式渲染）
  function lineLabelPositions(doll: UnseenDoll) {
    const groups: Record<string, { xs: number[]; y: number }> = {};
    doll.merch.forEach((m) => {
      const k = m.line ?? 'KR';
      (groups[k] ??= { xs: [], y: 0 });
      groups[k].xs.push(m.gridX ?? m.x ?? 0);
      groups[k].y = m.gridY ?? m.y ?? 0;
    });
    return Object.entries(groups).map(([line, g]) => {
      const minX = Math.min(...g.xs);
      const maxX = Math.max(...g.xs);
      return { line, x: Math.round((minX + maxX) / 2), y: g.y - 30 };
    });
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
              data-doll-id={doll.id}
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
                const floatDuration = 6.2 + (index % 4) * 0.9;
                const floatDelay = index * 0.55 + doll.id.length * 0.04;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`unseen-merch ${arranged && !overviewMode ? '' : 'unseen-merch--float'}`}
                    data-no-drag
                    data-doll-id={doll.id}
                    data-merch-index={index}
                    style={{
                      left: arranged && !overviewMode ? item.gridX ?? item.x ?? 0 : item.x,
                      top: arranged && !overviewMode ? item.gridY ?? item.y ?? 0 : item.y,
                      transitionDelay: arranged ? `${index * 0.04}s` : '0s',
                      ['--float-duration' as string]: `${floatDuration}s`,
                      ['--float-delay' as string]: `${floatDelay}s`,
                    }}
                    onClick={() => openDollDetail(doll, item)}
                  >
                    <img src={item.src} alt={item.label} draggable={false} />
                    <span className="unseen-merch__label">{item.label}</span>
                    {item.line ? (
                      <span
                        className={`unseen-merch__line unseen-merch__line--${item.line.toLowerCase()}`}
                      >
                        {item.line === 'KR' ? '韩版' : item.line === 'JP' ? '日版' : 'SEGA'}
                      </span>
                    ) : null}
                    {item.size ? (
                      <span className="unseen-merch__size">{item.size}</span>
                    ) : null}
                    {item.model ? (
                      <span className="unseen-merch__model">{item.model}</span>
                    ) : null}
                  </button>
                );
              })}

              {arranged && !overviewMode
                ? lineLabelPositions(doll).map((g) => (
                    <span
                      key={g.line}
                      className={`unseen-line-label unseen-line-label--${g.line.toLowerCase()}`}
                      style={{ left: g.x, top: g.y }}
                    >
                      {g.line === 'KR' ? '韩版' : g.line === 'JP' ? '日版' : 'SEGA'}
                    </span>
                  ))
                : null}
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
        <button
          type="button"
          className={`unseen-arrange-btn ${arranged ? 'is-active' : ''}`}
          onClick={toggleArrange}
        >
          {arranged ? '打散' : '按系列排列'}
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
          onClick={() => {
            setDetailDoll(null);
            setDetailMerch(null);
          }}
        >
          <div
            className="unseen-modal__panel"
            data-no-drag
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="unseen-modal__close"
              onClick={() => {
                setDetailDoll(null);
                setDetailMerch(null);
              }}
              aria-label="Close"
            >
              ×
            </button>
            <img
              className="unseen-modal__img"
              src={detailMerch ? detailMerch.src : detailDoll.src}
              alt={
                detailMerch
                  ? `${detailDoll.characterName} ${detailMerch.productName}`
                  : `${detailDoll.name} ${detailDoll.series}`
              }
            />
            <h2 id="unseen-modal-title" className="unseen-modal__title">
              {detailMerch
                ? `${detailDoll.characterName} · ${detailMerch.productName}`
                : `${detailDoll.characterName} · ${detailDoll.series}`}
            </h2>
            {detailMerch ? (
              <dl className="unseen-modal__meta">
                {detailMerch.line ? (
                  <div>
                    <dt>Line</dt>
                    <dd>
                      {detailMerch.line === 'KR'
                        ? '韩版'
                        : detailMerch.line === 'JP'
                          ? '日版'
                          : 'SEGA'}
                    </dd>
                  </div>
                ) : null}
                {detailMerch.size ? (
                  <div>
                    <dt>Size</dt>
                    <dd>{detailMerch.size}</dd>
                  </div>
                ) : null}
                {detailMerch.model ? (
                  <div>
                    <dt>Model</dt>
                    <dd>{detailMerch.model}</dd>
                  </div>
                ) : null}
                {detailMerch.jan ? (
                  <div>
                    <dt>JAN</dt>
                    <dd>{detailMerch.jan}</dd>
                  </div>
                ) : null}
                <div>
                  <dt>Year</dt>
                  <dd>{detailMerch.year}</dd>
                </div>
                <div>
                  <dt>Series</dt>
                  <dd>{detailMerch.collection}</dd>
                </div>
                {detailMerch.release ? (
                  <div>
                    <dt>Release</dt>
                    <dd>{detailMerch.release}</dd>
                  </div>
                ) : null}
              </dl>
            ) : (
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
            )}
            <p className="unseen-modal__source">
              {detailMerch ? detailMerch.collection : detailDoll.officialSource}
            </p>
            {!detailMerch ? (
              <p className="unseen-modal__desc">{detailDoll.description}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
