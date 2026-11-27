import { useEffect, useState, type CSSProperties, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import PanterVisionHero, { type PanterBackdrop } from '@/components/uicoms/PanterVisionHero';
import './experiment.css';

/** 玻璃字背后的平面：与页面一致的蓝 / 白 / 柠檬绿流动柔光，给玻璃折射出颜色 */
const drawBackdrop: PanterBackdrop = (ctx, w, h, t) => {
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#e6f4ff');
  bg.addColorStop(0.5, '#f4faff');
  bg.addColorStop(1, '#eef9d6');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const blob = (x: number, y: number, r: number, color: string) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  };
  const s = Math.max(w, h);
  blob(w * (0.02 + Math.sin(t * 0.31) * 0.08), h * (0.42 + Math.cos(t * 0.23) * 0.1), s * 0.55, 'rgba(31,159,255,0.95)');
  blob(w * (1.02 + Math.cos(t * 0.27) * 0.06), h * (0.12 + Math.sin(t * 0.21) * 0.08), s * 0.4, 'rgba(110,200,255,0.85)');
  blob(w * (0.5 + Math.sin(t * 0.37) * 0.16), h * (1.02 + Math.cos(t * 0.29) * 0.06), s * 0.5, 'rgba(204,255,16,0.95)');
  blob(w * (0.52 + Math.cos(t * 0.19) * 0.1), h * (0.42 + Math.sin(t * 0.33) * 0.08), s * 0.32, 'rgba(255,255,255,0.9)');
};

const SOCIALS = ['Instagram', 'Facebook', 'Tiktok', 'Pinterest', 'Twitter'];

const COLORS = [
  { key: 'acid-lime', label: 'Acid Lime', swatch: '#d6f53a' },
  { key: 'ice-blue', label: 'Ice Blue', swatch: '#9fdcff' },
];

const SIZES = [
  { key: 'small', label: 'Small', unit: '15ml' },
  { key: 'big', label: 'Big', unit: '50ml' },
];

function ExpandIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        d="M14 4h6v6M20 4l-6.5 6.5M10 20H4v-6M4 20l6.5-6.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchSparkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M19 11.5A7.5 7.5 0 1 1 12.2 4M17 17l4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M17.5 2.5 18.3 5l2.4.8-2.4.8-.8 2.4-.8-2.4-2.4-.8 2.4-.8z" fill="currentColor" />
    </svg>
  );
}

function ProductThumb() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden className="exp-bar__thumb">
      <defs>
        <linearGradient id="exp-thumb" x1="0" x2="1">
          <stop offset="0" stopColor="#b6e21e" />
          <stop offset=".45" stopColor="#f2ff9a" />
          <stop offset="1" stopColor="#a6d214" />
        </linearGradient>
      </defs>
      <path d="M14 4h12l2 6v22a4 4 0 0 1-4 4h-8a4 4 0 0 1-4-4V10z" fill="url(#exp-thumb)" />
      <rect x="15" y="1" width="10" height="5" rx="1.5" fill="#f4ffc8" />
      <path d="M16 18h8M16 21h6" stroke="#5a7a00" strokeWidth=".8" strokeLinecap="round" />
    </svg>
  );
}

export default function ExperimentPage() {
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);
  const [color, setColor] = useState(COLORS[0].key);
  const [size, setSize] = useState(SIZES[0].key);
  const [cart, setCart] = useState(0);
  const [full, setFull] = useState(false);

  useEffect(() => {
    const body = document.body;
    const prev = { overflow: body.style.overflow, bg: body.style.background };
    body.style.overflow = 'auto';
    body.style.background = '#eaf6ff';
    return () => {
      body.style.overflow = prev.overflow;
      body.style.background = prev.bg;
    };
  }, []);

  useEffect(() => {
    const onFs = () => setFull(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  const toggleFull = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.();
  };

  const onJoin = (e: FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return;
    setJoined(true);
    setEmail('');
  };

  const current = COLORS.find((c) => c.key === color) ?? COLORS[0];

  return (
    <div className="exp">
      <div className="exp__bg" aria-hidden>
        <span className="exp__blob exp__blob--blue" />
        <span className="exp__blob exp__blob--sky" />
        <span className="exp__blob exp__blob--lime" />
        <span className="exp__blob exp__blob--mint" />
        <span className="exp__blob exp__blob--white" />
        <span className="exp__frost" />
        <span className="exp__grain" />
      </div>

      <header className="exp-top">
        <nav className="exp-top__tab">
          <Link to="/menu" className="default-link exp-top__brand">
            Experiment
          </Link>
          <a href="#shop" className="default-link">
            Shop
          </a>
        </nav>
        <form className="exp-top__form" onSubmit={onJoin}>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setJoined(false);
            }}
            placeholder={joined ? 'thanks — you are on the list' : 'give us your email'}
            aria-label="Email"
          />
          <button type="submit">Sign up</button>
        </form>
      </header>

      <h1 className="exp-shop" id="shop">
        Shop
      </h1>

      <div className="exp-hero">
        <PanterVisionHero className="exp-hero__glass" glassText="ITZY" motion="together" backdrop={drawBackdrop} dprCap={1.75} title="Experiment glass ITZY" />
      </div>

      <section className="exp-about">
        <p>
          Experiment is a next gen science-driven beauty brand. We make unexpected essentials that are clinically
          proven, thoughtfully sustainable, and ridiculously fun.
        </p>
        <div className="exp-about__links">
          <ul>
            {SOCIALS.map((s) => (
              <li key={s}>
                <a href="#shop" className="default-link">
                  {s}
                </a>
              </li>
            ))}
          </ul>
          <ul>
            <li>
              <a href="#shop" className="default-link">
                Shop
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="exp-tools">
        <button type="button" className="exp-icon" onClick={toggleFull} aria-label={full ? '退出全屏' : '全屏'}>
          <ExpandIcon />
        </button>
        <Link to="/menu" className="exp-icon default-link" aria-label="搜索页面">
          <SearchSparkIcon />
        </Link>
      </div>

      <div className="exp-bar">
        <div className="exp-bar__product">
          <ProductThumb />
          <span className="exp-bar__name">Avant Guard</span>
        </div>
        <div className="exp-bar__group">
          <span className="exp-bar__label">Color</span>
          <button
            type="button"
            className="exp-pill is-on"
            style={{ '--pill': current.swatch } as CSSProperties}
            onClick={() => setColor(COLORS[(COLORS.indexOf(current) + 1) % COLORS.length].key)}
            title="切换颜色"
          >
            {current.label}
          </button>
        </div>
        <div className="exp-bar__group">
          <span className="exp-bar__label">Size</span>
          {SIZES.map((s) => (
            <button
              key={s.key}
              type="button"
              className={`exp-pill${s.key === size ? ' is-on' : ''}`}
              onClick={() => setSize(s.key)}
              title={s.unit}
            >
              {s.label}
              <i aria-hidden className={`exp-pill__dot exp-pill__dot--${s.key}`} />
            </button>
          ))}
        </div>
        <button type="button" className="exp-pill is-on exp-bar__cart" onClick={() => setCart((n) => n + 1)}>
          {cart ? `In cart · ${cart}` : 'Add to cart'}
        </button>
        <span className="exp-bar__sr" aria-live="polite">
          {cart ? `${cart} × Avant Guard ${current.label}` : ''}
        </span>
      </div>
    </div>
  );
}
