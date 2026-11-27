import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Link } from 'react-router-dom';
import AlbumCover from '@/pages/albums/AlbumCover';
import { ALBUMS, type AlbumEntry } from '@/pages/songs/songsData';
import '@/pages/albums/albums.css';
import './works.css';

const VIDEO = '/floatfolio/reel.mp4';
const MODES = ['flat', 'tilt', 'ring', 'gallery'] as const;
type Mode = (typeof MODES)[number];

type Item = { kind: 'album'; album: AlbumEntry; key: string } | { kind: 'reel'; key: string };
type Pose = { x: number; y: number; z: number; rx: number; ry: number; rz: number; s: number };

/** 与参考里 Framer 组件面板一致的几项参数 */
const PUSH_RADIUS = 253;
const PUSH_STRENGTH = 80;
const MAX_FLIP = 85;
const PERSPECTIVE = 1548;
const SPIN_SPEED = 0.1;

const pad = (n: number) => String(n).padStart(2, '0');

function wrap(i: number, n: number) {
  return ((i % n) + n) % n;
}

function targetPose(mode: Mode, i: number, n: number, spin: number, gallery: number, r: number, card: number): Pose {
  const t = (i / n) * Math.PI * 2 + spin;
  switch (mode) {
    case 'flat':
      return { x: Math.cos(t) * r * 0.78, y: Math.sin(t) * r * 0.78, z: 0, rx: 0, ry: 0, rz: 0, s: 1 };
    case 'tilt': {
      const tilt = (62 * Math.PI) / 180;
      return {
        x: Math.cos(t) * r * 1.1,
        y: Math.sin(t) * r * Math.cos(tilt) - r * 0.08,
        z: Math.sin(t) * r * Math.sin(tilt),
        rx: 0,
        ry: 0,
        rz: -4,
        s: 1,
      };
    }
    case 'ring':
      return {
        x: Math.cos(t) * r * 1.15,
        y: Math.sin(t) * r * 0.22,
        z: Math.sin(t) * r * 0.9,
        rx: 0,
        ry: -Math.cos(t) * 38,
        rz: 0,
        s: 1.15,
      };
    case 'gallery': {
      let d = i - gallery;
      d = d - Math.round(d / n) * n;
      return { x: d * card * 2.9, y: 0, z: -Math.abs(d) * 40, rx: 0, ry: d * -6, rz: 0, s: 2.6 };
    }
  }
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
    </svg>
  );
}

export default function WorksPage() {
  const items = useMemo<Item[]>(() => {
    const list: Item[] = ALBUMS.map((album) => ({ kind: 'album', album, key: album.name }));
    list.splice(Math.floor(list.length / 2), 0, { kind: 'reel', key: 'reel' });
    return list;
  }, []);
  const n = items.length;

  const [mode, setMode] = useState<Mode>('ring');
  const [front, setFront] = useState(0);
  const [open, setOpen] = useState<Item | null>(null);

  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const modeRef = useRef<Mode>(mode);
  const state = useRef({
    spin: 0,
    vel: 0,
    gallery: 0,
    galleryTarget: 0,
    pointer: { x: -9999, y: -9999, inside: false },
    drag: null as null | { x: number; moved: number },
    poses: [] as Pose[],
    front: 0,
  });

  modeRef.current = mode;

  useEffect(() => {
    const body = document.body;
    const prev = { overflow: body.style.overflow, bg: body.style.background };
    body.style.overflow = 'hidden';
    body.style.background = '#e7e7e7';
    return () => {
      body.style.overflow = prev.overflow;
      body.style.background = prev.bg;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') state.current.galleryTarget += 1;
      if (e.key === 'ArrowLeft') state.current.galleryTarget -= 1;
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const s = state.current;
      if (modeRef.current === 'gallery') s.galleryTarget += Math.sign(e.deltaY + e.deltaX) * 0.5;
      else s.vel += (e.deltaY + e.deltaX) * 0.00012;
    };
    stage.addEventListener('wheel', onWheel, { passive: false });
    return () => stage.removeEventListener('wheel', onWheel);
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let last = performance.now();

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const stage = stageRef.current;
      if (!stage) return;
      const s = state.current;
      const m = modeRef.current;

      if (!s.drag && !reduced && m !== 'gallery') s.spin += SPIN_SPEED * dt;
      s.spin += s.vel;
      s.vel *= 0.92;
      s.gallery += (s.galleryTarget - s.gallery) * Math.min(1, dt * 7);

      const w = stage.clientWidth;
      const h = stage.clientHeight;
      const r = Math.min(w * 0.38, h * 0.4);
      const card = Math.max(40, Math.min(74, w * 0.05));
      const ease = Math.min(1, dt * 6);
      const rect = stage.getBoundingClientRect();
      const px = s.pointer.x - rect.left - w / 2;
      const py = s.pointer.y - rect.top - h / 2;

      let bestZ = -Infinity;
      let best = s.front;

      for (let i = 0; i < n; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;
        const tp = targetPose(m, i, n, s.spin, s.gallery, r, card);

        let { x, y } = tp;
        let rx = tp.rx;
        let ry = tp.ry;
        if (s.pointer.inside && m !== 'gallery' && !reduced) {
          const persp = PERSPECTIVE / (PERSPECTIVE - tp.z);
          const dx = x * persp - px;
          const dy = y * persp - py;
          const d = Math.hypot(dx, dy);
          if (d < PUSH_RADIUS && d > 0.001) {
            const f = (1 - d / PUSH_RADIUS) ** 2;
            x += (dx / d) * f * PUSH_STRENGTH;
            y += (dy / d) * f * PUSH_STRENGTH;
            rx += (-dy / d) * f * MAX_FLIP * 0.5;
            ry += (dx / d) * f * MAX_FLIP * 0.5;
          }
        }

        const p = (s.poses[i] ??= { ...tp });
        p.x += (x - p.x) * ease;
        p.y += (y - p.y) * ease;
        p.z += (tp.z - p.z) * ease;
        p.rx += (rx - p.rx) * ease;
        p.ry += (ry - p.ry) * ease;
        p.rz += (tp.rz - p.rz) * ease;
        p.s += (tp.s - p.s) * ease;

        el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, ${p.z.toFixed(1)}px) rotateX(${p.rx.toFixed(1)}deg) rotateY(${p.ry.toFixed(1)}deg) rotateZ(${p.rz.toFixed(1)}deg) scale(${p.s.toFixed(3)})`;
        el.style.zIndex = String(Math.round(p.z + 2000));

        const score = m === 'flat' ? p.y : m === 'gallery' ? -Math.abs(p.x) : p.z;
        if (score > bestZ) {
          bestZ = score;
          best = i;
        }
      }

      if (best !== s.front) {
        s.front = best;
        setFront(best);
      }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [n]);

  const onPointerMove = (e: ReactPointerEvent) => {
    const s = state.current;
    s.pointer = { x: e.clientX, y: e.clientY, inside: true };
    if (s.drag) {
      const dx = e.clientX - s.drag.x;
      s.drag.x = e.clientX;
      s.drag.moved += Math.abs(dx);
      if (modeRef.current === 'gallery') s.galleryTarget -= dx / 160;
      else s.vel += dx * 0.00018;
    }
  };

  const onPointerDown = (e: ReactPointerEvent) => {
    state.current.drag = { x: e.clientX, moved: 0 };
  };

  const endDrag = () => {
    const s = state.current;
    if (s.drag && modeRef.current === 'gallery') s.galleryTarget = Math.round(s.galleryTarget);
    window.setTimeout(() => (s.drag = null), 0);
  };

  const onCardClick = (item: Item, i: number) => {
    const s = state.current;
    if (s.drag && s.drag.moved > 6) return;
    if (mode === 'gallery' && wrap(Math.round(s.gallery), n) !== i) {
      let d = i - s.galleryTarget;
      d = d - Math.round(d / n) * n;
      s.galleryTarget += d;
      return;
    }
    setOpen(item);
  };

  const pickMode = (m: Mode) => {
    if (m === 'gallery') state.current.galleryTarget = front + Math.round((state.current.galleryTarget - front) / n) * n;
    setMode(m);
  };

  const frontItem = items[front];

  return (
    <div className="wk">
      <Link to="/menu" className="wk__back default-link">
        ← menu
      </Link>

      <header className="wk__head">
        <h1>Selected works</h1>
        <nav className="wk__modes" aria-label="Layout">
          {MODES.map((m) => (
            <button key={m} type="button" className={m === mode ? 'is-on' : undefined} onClick={() => pickMode(m)}>
              {m}
            </button>
          ))}
        </nav>
      </header>

      <main
        ref={stageRef}
        className={`wk__stage wk__stage--${mode}`}
        style={{ perspective: `${PERSPECTIVE}px` }}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={() => {
          state.current.pointer.inside = false;
          endDrag();
        }}
      >
        <div className="wk__world">
          {items.map((item, i) => (
            <button
              key={item.key}
              type="button"
              ref={(el) => (cardRefs.current[i] = el)}
              className={`wk__card${item.kind === 'reel' ? ' wk__card--reel' : ''}${i === front ? ' is-front' : ''}`}
              onClick={() => onCardClick(item, i)}
              aria-label={item.kind === 'reel' ? 'reference reel' : item.album.name}
            >
              {item.kind === 'reel' ? (
                <span className="wk__reel">
                  <video src={VIDEO} autoPlay muted loop playsInline preload="auto" />
                  <i>
                    <PlayIcon />
                  </i>
                </span>
              ) : (
                <AlbumCover album={item.album} className="wk__cover" label={mode === 'gallery'} />
              )}
            </button>
          ))}
        </div>
      </main>

      <footer className="wk__foot">
        <span>Scroll to explore</span>
        <span className="wk__caption">
          {frontItem?.kind === 'album' ? frontItem.album.name : 'Reference reel'}
        </span>
        <span className="wk__count">
          {pad(front + 1)} — {pad(n)}
        </span>
      </footer>

      {open && (
        <div className="wk__box" role="dialog" aria-modal onClick={() => setOpen(null)}>
          <div className="wk__box-body" onClick={(e) => e.stopPropagation()}>
            {open.kind === 'reel' ? (
              <video className="wk__box-video" src={VIDEO} autoPlay controls loop playsInline />
            ) : (
              <>
                <AlbumCover album={open.album} label className="wk__box-cover" />
                <div className="wk__box-info">
                  <span>
                    {open.album.albumType} · {open.album.market} · {open.album.releaseDate.replace(/-/g, '.')}
                  </span>
                  <h2>{open.album.name}</h2>
                  <ol>
                    {open.album.tracks.map((t) => (
                      <li key={t} className={t === open.album.titleTrack ? 'is-title' : undefined}>
                        {t}
                      </li>
                    ))}
                  </ol>
                </div>
              </>
            )}
            <button type="button" className="wk__box-close" onClick={() => setOpen(null)}>
              close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
