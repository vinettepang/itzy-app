import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Link } from 'react-router-dom';
import './misplaced.css';

const VIDEO = '/misplaced/bag.mp4';

const SECTIONS = [
  {
    key: 'object',
    label: 'Object',
    title: 'One clear bag',
    body: 'A thin PVC tote, folded by hand. Everything inside stays visible, nothing gets to hide.',
  },
  {
    key: 'context',
    label: 'Context',
    title: 'Carried, not kept',
    body: 'Packed on a morning train and emptied at night. A portrait of a day told only by what it needed.',
  },
  {
    key: 'color',
    label: 'Color',
    title: 'Loud through clear',
    body: 'Signal red print, fuchsia lacquer and acid lime plastic, softened behind a milky skin.',
  },
  {
    key: 'place',
    label: 'Place',
    title: 'Tokyo — Seoul',
    body: '35.68° N 139.69° E → 37.56° N 126.97° E. Two cities, one bag, the same small rituals.',
  },
] as const;

type SectionKey = (typeof SECTIONS)[number]['key'];

const ITEMS = [
  { name: 'Clear PVC tote', note: 'vessel', color: 'rgba(255,255,255,.9)' },
  { name: 'RINSE magazine', note: 'issue 04', color: '#e3262b' },
  { name: 'Fuchsia lipstick', note: 'satin', color: '#e0218a' },
  { name: 'Lime compact', note: 'powder', color: '#c3e23a' },
  { name: 'Wired earphones', note: 'tangled', color: '#1b1b1b' },
  { name: 'Lip balm tin', note: 'mint', color: '#bfe8d4' },
];

const PALETTE = ['#e3262b', '#e0218a', '#c3e23a', '#1b1b1b', '#e9e9e9'];

function Globes() {
  return (
    <svg viewBox="0 0 66 22" aria-hidden className="mis-card__globes">
      {[11, 33, 55].map((cx) => (
        <g key={cx} fill="none" stroke="currentColor" strokeWidth="1">
          <circle cx={cx} cy="11" r="9.5" />
          <ellipse cx={cx} cy="11" rx="4.2" ry="9.5" />
          <path d={`M${cx - 9.5} 11h19M${cx - 8.3} 6.5h16.6M${cx - 8.3} 15.5h16.6`} />
        </g>
      ))}
    </svg>
  );
}

export default function MisplacedPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const drag = useRef<{ x: number; t: number; w: number } | null>(null);
  const [active, setActive] = useState<SectionKey>('object');
  const [dragging, setDragging] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const body = document.body;
    const prev = { overflow: body.style.overflow, bg: body.style.background };
    body.style.overflow = 'auto';
    body.style.background = '#e9e9e9';
    return () => {
      body.style.overflow = prev.overflow;
      body.style.background = prev.bg;
    };
  }, []);

  const section = SECTIONS.find((s) => s.key === active) ?? SECTIONS[0];

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    v.pause();
    drag.current = { x: e.clientX, t: v.currentTime, w: e.currentTarget.clientWidth };
    setDragging(true);
  };

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    const d = drag.current;
    if (!v || !d) return;
    const dur = v.duration;
    const t = d.t + ((e.clientX - d.x) / d.w) * dur;
    v.currentTime = ((t % dur) + dur) % dur;
  };

  const onUp = () => {
    if (!drag.current) return;
    drag.current = null;
    setDragging(false);
    if (!paused) void videoRef.current?.play();
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      void v.play();
      setPaused(false);
    } else {
      v.pause();
      setPaused(true);
    }
  };

  return (
    <div className="mis">
      <Link to="/menu" className="mis__back default-link">
        ← Menu
      </Link>

      <header className="mis__head">
        <span>A study in</span>
        <h1>Misplaced Beauty</h1>
      </header>

      <nav className="mis__index" aria-label="Sections">
        {SECTIONS.map((s, i) => (
          <button
            key={s.key}
            type="button"
            className={`mis__index-item${s.key === active ? ' is-active' : ''}`}
            onClick={() => setActive(s.key)}
          >
            <i />
            <b>{String(i + 1).padStart(2, '0')}</b>
            <span>{s.label}</span>
          </button>
        ))}
      </nav>

      <main className="mis__stage">
        <div
          className={`mis__video${dragging ? ' is-dragging' : ''}`}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          <video ref={videoRef} src={VIDEO} autoPlay muted loop playsInline preload="auto" />
        </div>
        <div className="mis__hint">
          <span>← drag to turn →</span>
          <button type="button" onClick={togglePlay}>
            {paused ? 'play' : 'pause'}
          </button>
        </div>
      </main>

      <section className="mis__copy" key={section.key}>
        <span className="mis__copy-num">
          {String(SECTIONS.indexOf(section) + 1).padStart(2, '0')} / {section.label}
        </span>
        <h2>{section.title}</h2>
        <p>{section.body}</p>
        {section.key === 'color' && (
          <div className="mis__palette">
            {PALETTE.map((c) => (
              <span key={c} style={{ background: c }} title={c} />
            ))}
          </div>
        )}
      </section>

      <aside className="mis__items">
        <h3>
          Contents <em>({String(ITEMS.length).padStart(2, '0')})</em>
        </h3>
        <ol>
          {ITEMS.map((it) => (
            <li key={it.name}>
              <i style={{ background: it.color }} />
              <span>{it.name}</span>
              <em>{it.note}</em>
            </li>
          ))}
        </ol>
      </aside>

      <div className="mis-card">
        <p className="mis-card__title">
          A study in
          <br />
          misplaced beauty
        </p>
        <div className="mis-card__row">
          <span>+</span>
          <Globes />
          <span>+</span>
        </div>
        <p className="mis-card__foot">
          Tokyo — Seoul
          <br />
          misplacedbeauty.com
        </p>
      </div>
    </div>
  );
}
