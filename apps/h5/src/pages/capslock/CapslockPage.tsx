import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import AlbumCover from '@/pages/albums/AlbumCover';
import { ALBUMS, type AlbumEntry } from '@/pages/songs/songsData';
import '@/pages/albums/albums.css';
import './capslock.css';

const VIDEO = '/capslock/reel.mp4';
const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DROP_WINDOW = 24 * 3.6e6;

type Card = { album: AlbumEntry; variant: number; key: string };
type Pose = { x: number; y: number; z: number; ry: number; o: number };
type ShapeFn = (u: number, s: number) => Pose;

/** 封面沿这些路径排布，循环变形：圆环 → 倒三角 → 碗形 */
const SHAPES: ShapeFn[] = [
  (u, s) => {
    const t = u * Math.PI * 2;
    return { x: Math.cos(t) * s * 0.92, y: Math.sin(t) * s * 0.2, z: Math.sin(t) * s * 0.55, ry: -t - Math.PI / 2, o: 1 };
  },
  (u, s) => {
    const v: [number, number][] = [
      [-1, -0.62],
      [1, -0.62],
      [0, 0.9],
    ];
    const side = Math.floor(u * 3) % 3;
    const f = u * 3 - Math.floor(u * 3);
    const [ax, ay] = v[side];
    const [bx, by] = v[(side + 1) % 3];
    const x = (ax + (bx - ax) * f) * s * 0.78;
    const y = (ay + (by - ay) * f) * s * 0.78;
    return { x, y, z: Math.sin(u * Math.PI * 6) * s * 0.08, ry: (x / s) * 0.5, o: 1 };
  },
  (u, s) => {
    const k = u * 2 - 1;
    const edge = Math.min(1, Math.min(u, 1 - u) / 0.06);
    return {
      x: k * s * 0.95,
      y: (0.34 * (1 - k * k) - 0.16) * s,
      z: -Math.abs(k) * s * 0.35,
      ry: k * 0.9,
      o: edge,
    };
  },
];

const HOLD = 3.6;
const MORPH = 1.4;

function ease(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function lerpAngle(a: number, b: number, t: number) {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}

/** 和原片一样从 24:00:00 开始倒数，发售时间即打开页面后的 24 小时 */
function nextDrop(now = Date.now()) {
  return new Date(now + DROP_WINDOW);
}

const pad = (n: number) => String(n).padStart(2, '0');

function CsLogo() {
  return (
    <span className="cs-logo" aria-label="CS">
      C<b>S</b>
    </span>
  );
}

function BellIcon({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0"
        fill={on ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function CapslockPage() {
  const cards = useMemo<Card[]>(
    () =>
      [0, 1].flatMap((variant) =>
        ALBUMS.map((album) => ({ album, variant, key: `${album.name}-${variant}` })),
      ),
    [],
  );
  const drop = useMemo(() => nextDrop(), []);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const clockRef = useRef<HTMLSpanElement>(null);
  const csRef = useRef<HTMLElement>(null);
  const hoverRef = useRef(false);
  const [picked, setPicked] = useState<Card | null>(null);
  const [notify, setNotify] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const body = document.body;
    const prev = { overflow: body.style.overflow, bg: body.style.background };
    body.style.overflow = 'auto';
    body.style.background = '#000';
    return () => {
      body.style.overflow = prev.overflow;
      body.style.background = prev.bg;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPicked(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let phase = 0;
    let last = performance.now();
    const start = last;
    const n = cards.length;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const left = Math.max(0, drop.getTime() - Date.now());
      const h = Math.floor(left / 3.6e6);
      const m = Math.floor((left % 3.6e6) / 6e4);
      const s = Math.floor((left % 6e4) / 1000);
      const cs = Math.floor((left % 1000) / 10);
      if (clockRef.current) clockRef.current.textContent = `${pad(h)} : ${pad(m)} : ${pad(s)}`;
      if (csRef.current) csRef.current.textContent = pad(cs);

      const stage = stageRef.current;
      if (!stage) return;
      if (!hoverRef.current && !reduced) phase += dt * 0.035;

      const size = Math.min(stage.clientWidth * 0.5, stage.clientHeight * 0.78);
      const t = reduced ? 0 : (now - start) / 1000;
      const cycle = HOLD + MORPH;
      const idx = Math.floor(t / cycle);
      const local = t - idx * cycle;
      const from = SHAPES[idx % SHAPES.length];
      const to = SHAPES[(idx + 1) % SHAPES.length];
      const k = local < HOLD ? 0 : ease((local - HOLD) / MORPH);

      for (let i = 0; i < n; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;
        const u = (((i / n + phase) % 1) + 1) % 1;
        const a = from(u, size);
        const b = to(u, size);
        const x = a.x + (b.x - a.x) * k;
        const y = a.y + (b.y - a.y) * k;
        const z = a.z + (b.z - a.z) * k;
        const ry = lerpAngle(a.ry, b.ry, k);
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateY(${ry.toFixed(3)}rad)`;
        el.style.opacity = (a.o + (b.o - a.o) * k).toFixed(2);
      }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [cards, drop]);

  const toggleSound = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    if (!v.muted) void v.play();
    setMuted(v.muted);
  };

  const dropDay = (drop.getDay() + 6) % 7;
  const dateLabel = `${pad(drop.getDate())}/${pad(drop.getMonth() + 1)}/${drop.getFullYear()}`;
  const timeLabel = `${pad(drop.getHours() % 12 || 12)}.${pad(drop.getMinutes())} ${drop.getHours() < 12 ? 'am' : 'pm'}`;

  return (
    <div className={`cs${picked ? ' has-pick' : ''}`}>
      <Link to="/menu" className="cs__back default-link">
        ← menu
      </Link>

      <header className="cs__clock">
        <span className="cs__label">time remaining</span>
        <p>
          <span ref={clockRef}>24 : 00 : 00</span>
          <small>
            : <em ref={csRef}>00</em>
          </small>
        </p>
      </header>

      <div className="cs__brand">
        <CsLogo />
        <button
          type="button"
          className={`cs__bell${notify ? ' is-on' : ''}`}
          onClick={() => setNotify((v) => !v)}
          aria-pressed={notify}
          aria-label="drop reminder"
        >
          <BellIcon on={notify} />
        </button>
        {notify && <span className="cs__bell-note">we&apos;ll ring you at {timeLabel}</span>}
      </div>

      <main
        className="cs__stage"
        ref={stageRef}
        onPointerEnter={() => (hoverRef.current = true)}
        onPointerLeave={() => (hoverRef.current = false)}
      >
        <div className="cs__ring">
          {cards.map((c, i) => (
            <button
              key={c.key}
              type="button"
              ref={(el) => (cardRefs.current[i] = el)}
              className="cs__card"
              onClick={() => setPicked(c)}
              aria-label={c.album.name}
            >
              <AlbumCover album={c.album} variant={c.variant} className="cs__cover" />
            </button>
          ))}
        </div>

        {picked && (
          <div className="cs__pick" role="dialog" aria-label={picked.album.name} onClick={() => setPicked(null)}>
            <div className="cs__pick-body" onClick={(e) => e.stopPropagation()}>
              <AlbumCover album={picked.album} variant={picked.variant} label className="cs__pick-cover" />
              <div className="cs__pick-info">
                <span className="cs__label">
                  {picked.album.albumType} · {picked.album.market}
                </span>
                <h2>{picked.album.name}</h2>
                <p className="cs__pick-date">{picked.album.releaseDate.split('-').reverse().join('/')}</p>
                <ol>
                  {picked.album.tracks.map((t) => (
                    <li key={t} className={t === picked.album.titleTrack ? 'is-title' : undefined}>
                      {t}
                    </li>
                  ))}
                </ol>
                <button type="button" className="cs__pick-close" onClick={() => setPicked(null)}>
                  close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <aside className="cs__reel">
        <video ref={videoRef} src={VIDEO} autoPlay muted loop playsInline preload="auto" />
        <div className="cs__reel-bar">
          <span>reel — @capslock.works</span>
          <button type="button" onClick={toggleSound}>
            {muted ? 'sound off' : 'sound on'}
          </button>
        </div>
      </aside>

      <footer className="cs__foot">
        <div className="cs__when">
          <span>tomorrow</span>
          <span>{timeLabel}</span>
        </div>
        <ul className="cs__week">
          {WEEKDAYS.map((d, i) => (
            <li key={d} className={i === dropDay ? 'is-on' : undefined}>
              {d}
            </li>
          ))}
        </ul>
        <span className="cs__date">{dateLabel}</span>
      </footer>
    </div>
  );
}
