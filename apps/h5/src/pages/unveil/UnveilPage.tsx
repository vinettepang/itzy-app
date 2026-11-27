import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import AlbumCover from '@/pages/albums/AlbumCover';
import { ALBUMS, type AlbumEntry } from '@/pages/songs/songsData';
import '@/pages/albums/albums.css';
import './unveil.css';

const VIDEO = '/unveil/reel.mp4';
const TABS = ['projects', 'studio', 'contact'] as const;
type Tab = (typeof TABS)[number];
const EFFECTS = ['zoom', 'shatter', 'dissolve', 'dither'] as const;
/** slide：右下角菜单切换时的 3D 轮播；其余在滚轮 / 方向键切换时轮换 */
type Effect = (typeof EFFECTS)[number] | 'slide';
const FLY_MS = 850;
const WASH_MS = 560;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** 与 CSS 中 .uv-focus__frame 的宽度保持一致 */
const frameSize = (w: number, h: number, big: boolean) =>
  w <= 760 ? w * (big ? 0.9 : 0.7) : big ? Math.min(0.7 * h, 0.46 * w) : Math.min(0.44 * h, 0.34 * w);

const pad = (n: number) => String(n).padStart(2, '0');
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const mod = (v: number, n: number) => ((v % n) + n) % n;
/** 把卡片相对位置折回 [-n/2, n/2)，让堆叠首尾相接、无限循环 */
const wrap = (d: number, n: number) => mod(d + n / 2, n) - n / 2;
const STACK_ANGLE = -28;
/** 悬停时专辑沿自身平面向右抽出的距离（卡片宽度的比例，原视频约 0.7） */
const PUSH_OUT = 0.7;
/** 抽出 / 收回用临界阻尼弹簧的角频率：起步柔和、无回弹，抽出约 0.7s 稳定，收回约 0.8s */
const PUSH_IN_OMEGA = 8.5;
const PUSH_BACK_OMEGA = 7.5;
/** 整个专辑列表（封面和间距）缩小到 72% */
const CARD_SCALE = 0.72;
const STACK_SCALE = 0.72;
const HOVER_ZOOM = 1.05;

/** 共享碟片表之外的 3 张单曲，只在本页按发行时间并入 */
const EXTRA_ALBUMS: AlbumEntry[] = [
  {
    name: "IT'z DIFFERENT",
    titleTrack: 'DALLA DALLA',
    tracks: ['DALLA DALLA', 'WANT IT?'],
    releaseDate: '2019-02-12',
    albumType: '单曲',
    market: '韩语',
  },
  {
    name: 'Not Shy (English Ver.)',
    titleTrack: 'Not Shy (English Ver.)',
    tracks: ['Not Shy (English Ver.)'],
    releaseDate: '2021-01-22',
    albumType: '单曲',
    market: '英语',
  },
  {
    name: 'Boys Like You',
    titleTrack: 'Boys Like You',
    tracks: ['Boys Like You'],
    releaseDate: '2022-10-21',
    albumType: '单曲',
    market: '英语',
  },
];
const UNVEIL_ALBUMS = [...ALBUMS, ...EXTRA_ALBUMS].sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));
/** 以撞击点为中心的放射状碎片（多边形百分比坐标） */
function makeShards(cx = 54, cy = 46) {
  const rays = 9;
  const rings = [0, 18, 46, 140];
  const angles = Array.from({ length: rays }, (_, i) => (i / rays) * Math.PI * 2 + (i % 2 ? 0.18 : -0.12));
  const pt = (a: number, r: number) => `${(cx + Math.cos(a) * r).toFixed(1)}% ${(cy + Math.sin(a) * r).toFixed(1)}%`;
  const shards: { clip: string; dx: number; dy: number; rot: number; delay: number }[] = [];
  for (let k = 0; k < rings.length - 1; k++) {
    for (let i = 0; i < rays; i++) {
      const a0 = angles[i];
      const a1 = angles[(i + 1) % rays] + (i === rays - 1 ? Math.PI * 2 : 0);
      const r0 = rings[k];
      const r1 = rings[k + 1];
      const poly = r0 === 0 ? [`${cx}% ${cy}%`, pt(a0, r1), pt(a1, r1)] : [pt(a0, r0), pt(a0, r1), pt(a1, r1), pt(a1, r0)];
      const mid = (a0 + a1) / 2;
      const push = 40 + k * 60;
      shards.push({
        clip: `polygon(${poly.join(',')})`,
        dx: Math.cos(mid) * push,
        dy: Math.sin(mid) * push + 120 + k * 40,
        rot: (i % 2 ? 1 : -1) * (12 + k * 14),
        delay: k * 60 + i * 8,
      });
    }
  }
  return shards;
}

const SHARDS = makeShards();

function ExpandIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden>
      <path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function EyeLogo() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden>
      <rect width="40" height="40" fill="#0b0b0b" />
      <path d="M7 20c4-6 9-9 13-9s9 3 13 9c-4 6-9 9-13 9s-9-3-13-9z" fill="none" stroke="#fff" strokeWidth="1.6" />
      <circle cx="20" cy="20" r="4.4" fill="#fff" />
    </svg>
  );
}

/** 网站截图风格的卡片：三种版式轮换 */
function SiteCard({ album, index }: { album: AlbumEntry; index: number }) {
  const layout = index % 3;
  const year = album.releaseDate.slice(0, 4);
  if (layout === 0) {
    return (
      <div className="uv-site uv-site--panel">
        <AlbumCover album={album} className="uv-site__bg" />
        <div className="uv-site__paper">
          <h3>{album.name}</h3>
          <span>
            {album.titleTrack} — {year}
          </span>
        </div>
      </div>
    );
  }
  if (layout === 1) {
    return (
      <div className="uv-site uv-site--dark">
        <div className="uv-site__bar">
          <i />
          <i />
          <i />
          <span>{album.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.itzy</span>
        </div>
        <div className="uv-site__split">
          <AlbumCover album={album} variant={1} className="uv-site__thumb" />
          <ul>
            {album.tracks.slice(0, 5).map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
  return (
    <div className="uv-site uv-site--poster">
      <AlbumCover album={album} variant={2} className="uv-site__bg" />
      <h3>{album.titleTrack}</h3>
      <span>
        {album.albumType} / {album.market} / {year}
      </span>
    </div>
  );
}

/** 用原视频逐帧做半调网点：亮度越暗点越大 */
function HalftoneReel({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    void video.play().catch(() => undefined);
    const ctx = canvas.getContext('2d');
    const sample = document.createElement('canvas');
    const sctx = sample.getContext('2d', { willReadFrequently: true });
    if (!ctx || !sctx) return;
    const cols = 96;
    const rows = 64;
    sample.width = cols;
    sample.height = rows;
    let raf = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      if (video.readyState < 2) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const dpr = Math.min(2, window.devicePixelRatio);
      if (canvas.width !== Math.round(w * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      const crop = Math.min(vw / cols, vh / rows);
      sctx.drawImage(video, (vw - cols * crop) / 2, (vh - rows * crop) / 2, cols * crop, rows * crop, 0, 0, cols, rows);
      const data = sctx.getImageData(0, 0, cols, rows).data;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#f4f4f2';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#111';
      const cw = w / cols;
      const ch = h / rows;
      const rMax = Math.min(cw, ch) * 0.62;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const o = (y * cols + x) * 4;
          const lum = (data[o] * 0.299 + data[o + 1] * 0.587 + data[o + 2] * 0.114) / 255;
          const dark = Math.pow(1 - lum, 1.2) * 1.6;
          if (dark < 0.06) continue;
          ctx.beginPath();
          ctx.arc((x + 0.5) * cw, (y + 0.5) * ch, rMax * Math.min(1, dark), 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      video.pause();
    };
  }, [active]);

  return (
    <div className="uv-halftone">
      <canvas ref={canvasRef} />
      <video ref={videoRef} src={VIDEO} muted loop playsInline preload="auto" />
    </div>
  );
}

type Transition = { from: number; to: number; effect: Effect; dir: 1 | -1; id: number };

export default function UnveilPage() {
  const albums = UNVEIL_ALBUMS;
  const n = albums.length;
  const [tab, setTab] = useState<Tab>('projects');
  const [focus, setFocus] = useState<number | null>(null);
  const [trans, setTrans] = useState<Transition | null>(null);
  const [reel, setReel] = useState(false);
  const [current, setCurrent] = useState(0);
  const [big, setBig] = useState(false);
  const [wash, setWash] = useState<'out' | 'in' | null>(null);
  const [enterId, setEnterId] = useState(0);

  const stageRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const bodyRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const hovered = useRef(-1);
  const scroll = useRef({ pos: 0, target: 0 });
  const effectIdx = useRef(0);
  const transId = useRef(0);
  /** 点击后卡片从堆叠飞到画面中央（to=1）或飞回堆叠（to=0） */
  const fly = useRef<{ i: number; from: number; to: number; start: number } | null>(null);
  const bigRef = useRef(false);
  bigRef.current = big;
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  useEffect(() => {
    const body = document.body;
    const prev = { overflow: body.style.overflow, bg: body.style.background };
    body.style.overflow = 'hidden';
    body.style.background = '#f6f6f4';
    return () => {
      body.style.overflow = prev.overflow;
      body.style.background = prev.bg;
    };
  }, []);

  const focusRef = useRef<number | null>(null);
  focusRef.current = focus;

  const washRef = useRef(wash);
  washRef.current = wash;

  const go = useCallback(
    (to: number, forced?: Effect) => {
      const from = focusRef.current;
      if (from === null || washRef.current) return;
      const next = ((to % n) + n) % n;
      if (next === from) return;
      const effect = forced ?? EFFECTS[effectIdx.current++ % EFFECTS.length];
      focusRef.current = next;
      setTrans({ from, to: next, effect, dir: to > from ? 1 : -1, id: ++transId.current });
      setFocus(next);
    },
    [n],
  );

  const closeFocus = useCallback(() => {
    const i = focusRef.current;
    if (i === null) return;
    fly.current = { i, from: 1, to: 0, start: performance.now() };
    setFocus(null);
    setTrans(null);
    setWash(null);
    setBig(false);
  }, []);

  /* 右下角放大按钮：先褪成白色离场，再以新尺寸带放射模糊重新进场 */
  const toggleBig = () => {
    if (wash || focusRef.current === null) return;
    setTrans(null);
    setWash('out');
    later(() => {
      setBig((b) => !b);
      setEnterId((k) => k + 1);
      setWash('in');
      later(() => setWash(null), 1000);
    }, WASH_MS);
  };

  useEffect(() => {
    if (!trans) return;
    const t = window.setTimeout(() => setTrans((cur) => (cur?.id === trans.id ? null : cur)), 1300);
    return () => window.clearTimeout(t);
  }, [trans]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (reel) setReel(false);
        else closeFocus();
      }
      if (focus !== null && (e.key === 'ArrowRight' || e.key === 'ArrowDown')) go(focus + 1);
      if (focus !== null && (e.key === 'ArrowLeft' || e.key === 'ArrowUp')) go(focus - 1);
      if (focus === null && tab === 'projects') {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') scroll.current.target = Math.round(scroll.current.target) + 1;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') scroll.current.target = Math.round(scroll.current.target) - 1;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeFocus, focus, go, n, reel, tab]);

  const wheelLock = useRef(0);
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    let snap = 0;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (focus === null && fly.current) return;
      const dy = e.deltaMode === 1 ? e.deltaY * 40 : e.deltaY;
      if (focus !== null) {
        const now = performance.now();
        /* 详情里滚轮一次切一张，用原视频的 3D 轮播；动画期间锁住，避免触控板惯性连跳 */
        if (now - wheelLock.current < 750 || Math.abs(dy) < 8) return;
        wheelLock.current = now;
        go(focus + Math.sign(dy), 'slide');
        return;
      }
      /* 鼠标滚轮一格 ≈ 一张专辑；触控板的细小增量连续滚动，停下后吸附到最近一张 */
      scroll.current.target += clamp(dy / 100, -1, 1);
      window.clearTimeout(snap);
      snap = window.setTimeout(() => {
        scroll.current.target = Math.round(scroll.current.target);
      }, 140);
    };
    let touch: { x: number; y: number; start: number } | null = null;
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      touch = { x: t.clientX, y: t.clientY, start: scroll.current.target };
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!touch) return;
      const t = e.touches[0];
      const d = t.clientY - touch.y + (t.clientX - touch.x) * 0.6;
      if (Math.abs(d) < 6) return;
      e.preventDefault();
      if (focus === null) scroll.current.target = touch.start - d * 0.012;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!touch) return;
      const t = e.changedTouches[0];
      const d = t.clientY - touch.y + (t.clientX - touch.x) * 0.6;
      touch = null;
      if (focus !== null) {
        if (Math.abs(d) > 40) go(focus - Math.sign(d));
        return;
      }
      scroll.current.target = Math.round(scroll.current.target);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    return () => {
      window.clearTimeout(snap);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [focus, go, n, tab]);

  /* 斜向纵深堆叠：越远越淡、越灰；滚动时卡片从前方飞过镜头 */
  useEffect(() => {
    if (tab !== 'projects') return;
    let raf = 0;
    let shown = -1;
    const push = new Float32Array(n);
    const pushVel = new Float32Array(n);
    let last = performance.now();
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      const s = scroll.current;
      s.pos += (s.target - s.pos) * 0.09;
      const stage = stageRef.current;
      if (!stage) return;
      const w = stage.clientWidth;
      const h = stage.clientHeight;

      const f = fly.current;
      let fp = 0;
      if (f) {
        const t = clamp((performance.now() - f.start) / FLY_MS, 0, 1);
        fp = lerp(f.from, f.to, easeInOut(t));
        if (t >= 1 && f.to === 0) fly.current = null;
      }
      /* 打开时其余卡片瞬间消失（与原视频一致）；关闭时先出现并让出空位，卡片插回后空位合拢 */
      const others = f ? (f.to === 1 ? 0 : clamp((1 - fp) * 3, 0, 1)) : 1;
      const gap = f && f.to === 0 ? fp * 0.9 : 0;
      const stack = stackRef.current;
      const ox = stack?.offsetLeft ?? w * 0.4;
      const oy = stack?.offsetTop ?? h * 0.64;
      const tx = w / 2 - ox;
      const ty = h / 2 - oy - (w <= 760 ? h * 0.09 : 0);
      for (let i = 0; i < n; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;
        const raw = wrap(i - s.pos, n);
        const d = f && f.i !== i ? raw + Math.sign(raw) * gap : raw;
        const step = w * 0.12 * STACK_SCALE;
        let x = d * step;
        let y = -d * h * 0.09 * STACK_SCALE;
        let z = -d * step * 0.8;
        let angle = STACK_ANGLE;
        let scale = CARD_SCALE;
        let fade = d < 0 ? clamp(1 + (d + 4) * 0.6, 0, 1) : clamp(1 - (d - 5) * 0.26, 0, 1);
        let gray = clamp((d - 1.5) * 0.2, 0, 1);
        if (f && f.i === i) {
          const target = frameSize(w, h, bigRef.current) / el.offsetWidth;
          x = lerp(x, tx, fp);
          y = lerp(y, ty, fp);
          z = lerp(z, 0, fp);
          angle = lerp(STACK_ANGLE, 0, fp);
          scale = lerp(scale, target, fp);
          fade = lerp(fade, 1, fp);
          gray = lerp(gray, 0, fp);
        } else {
          fade *= others;
        }
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateY(${angle.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
        el.style.setProperty('--fade', fade.toFixed(3));
        el.style.setProperty(
          '--tone',
          gray > 0.01 ? `grayscale(${gray.toFixed(2)}) contrast(${(1 - gray * 0.25).toFixed(2)})` : 'none',
        );
        el.style.visibility = fade < 0.01 ? 'hidden' : '';
        el.style.pointerEvents = fade < 0.3 ? 'none' : '';

        const want = hovered.current === i && fade > 0.3 ? 1 : 0;
        const omega = want ? PUSH_IN_OMEGA : PUSH_BACK_OMEGA;
        pushVel[i] += (omega * omega * (want - push[i]) - 2 * omega * pushVel[i]) * dt;
        push[i] = clamp(push[i] + pushVel[i] * dt, 0, 1);
        const p = push[i];
        const body = bodyRefs.current[i];
        if (body) {
          body.style.transform =
            p > 0.001 || Math.abs(pushVel[i]) > 0.001
              ? `translate3d(${(p * el.offsetWidth * PUSH_OUT).toFixed(1)}px, 0, ${(p * 16).toFixed(1)}px) scale(${lerp(1, HOVER_ZOOM, p).toFixed(4)})`
              : '';
          el.classList.toggle('is-hot', want === 1);
        }
      }
      const front = mod(Math.round(s.pos), n);
      if (front !== shown) {
        shown = front;
        setCurrent(front);
      }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [n, tab]);

  useEffect(() => {
    if (focus === null) return;
    const s = scroll.current;
    s.target = s.pos = s.pos + wrap(focus - s.pos, n);
  }, [focus, n]);

  const openFocus = (i: number) => {
    if (fly.current || focusRef.current !== null) return;
    effectIdx.current = 0;
    hovered.current = -1;
    setTrans(null);
    setBig(false);
    setEnterId(0);
    fly.current = { i, from: 0, to: 1, start: performance.now() };
    later(() => setFocus(i), FLY_MS);
  };

  const shown = focus ?? current;
  const album = albums[shown];

  const typeCounts = useMemo(() => {
    const map = new Map<string, number>();
    albums.forEach((a) => {
      map.set(a.albumType, (map.get(a.albumType) ?? 0) + 1);
      map.set(a.market, (map.get(a.market) ?? 0) + 1);
    });
    return [...map.entries()];
  }, [albums]);

  const years = `${albums[0].releaseDate.slice(0, 4)} — ${albums[n - 1].releaseDate.slice(0, 4)}`;

  return (
    <div className={`uv uv--${tab}${focus !== null ? ' is-focus' : ''}`}>
      <nav className="uv-tabs" aria-label="Sections">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            className={t === tab ? 'is-on' : undefined}
            onClick={() => {
              fly.current = null;
              setTab(t);
              setFocus(null);
              setTrans(null);
              setWash(null);
              setBig(false);
            }}
          >
            {t === 'projects' ? 'Unveil × Projects' : t}
          </button>
        ))}
      </nav>

      <Link to="/menu" className="uv-logo default-link" aria-label="menu">
        <EyeLogo />
      </Link>

      {tab === 'projects' && (
        <main className="uv-stage" ref={stageRef}>
          <div className="uv-stack" ref={stackRef} aria-hidden={focus !== null}>
            {albums.map((a, i) => (
              <button
                key={a.name}
                type="button"
                ref={(el) => (cardRefs.current[i] = el)}
                className="uv-card"
                onClick={() => openFocus(i)}
                onPointerEnter={() => (hovered.current = i)}
                onPointerLeave={() => {
                  if (hovered.current === i) hovered.current = -1;
                }}
                onFocus={() => (hovered.current = i)}
                onBlur={() => {
                  if (hovered.current === i) hovered.current = -1;
                }}
                aria-label={a.name}
                tabIndex={focus !== null ? -1 : 0}
              >
                <span className="uv-card__body" ref={(el) => (bodyRefs.current[i] = el)}>
                  <span className="uv-card__edge uv-card__edge--top" />
                  <span className="uv-card__edge uv-card__edge--right" />
                  <span className="uv-card__face">
                    <SiteCard album={a} index={i} />
                  </span>
                </span>
              </button>
            ))}
          </div>

          {focus !== null && (
            <section
              className={`uv-focus${big ? ' is-big' : ''}`}
              aria-label={album.name}
              onPointerMove={(e) => {
                const el = frameRef.current;
                if (!el || e.pointerType !== 'mouse') return;
                const r = el.getBoundingClientRect();
                const nx = clamp((e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2), -1, 1);
                const ny = clamp((e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2), -1, 1);
                el.style.setProperty('--tilt-x', (nx * 9).toFixed(2));
                el.style.setProperty('--tilt-y', (-ny * 6).toFixed(2));
              }}
              onPointerLeave={() => {
                frameRef.current?.style.setProperty('--tilt-x', '0');
                frameRef.current?.style.setProperty('--tilt-y', '0');
              }}
            >
              <div ref={frameRef} className={`uv-focus__frame${wash ? ` is-wash-${wash}` : ''}`}>
                {trans && trans.effect === 'slide' && (
                  <div
                    key={`sl-${trans.id}`}
                    className="uv-fx uv-fx--slide-out"
                    style={{ '--dir': trans.dir } as CSSProperties}
                    aria-hidden
                  >
                    <AlbumCover album={albums[trans.from]} className="uv-fx__cover" />
                  </div>
                )}

                {trans && trans.effect === 'zoom' && (
                  <div key={`zoom-${trans.id}`} className="uv-fx uv-fx--zoom-out">
                    <AlbumCover album={albums[trans.from]} className="uv-fx__cover" />
                  </div>
                )}

                <div
                  key={`cur-${focus}-${trans?.id ?? `open-${enterId}`}`}
                  className={`uv-focus__current${
                    trans ? ` is-in-${trans.effect}` : wash === 'in' ? ' is-expand' : enterId ? '' : ' is-open'
                  }`}
                  style={trans ? ({ '--dir': trans.dir } as CSSProperties) : undefined}
                >
                  <AlbumCover album={albums[focus]} className="uv-fx__cover" />
                  {(trans?.effect === 'zoom' || (!trans && wash === 'in')) && (
                    <span className="uv-zoomblur" aria-hidden>
                      {[1, 2, 3, 4, 5, 6].map((k) => (
                        <AlbumCover
                          key={k}
                          album={albums[focus]}
                          className="uv-zoomblur__copy"
                          style={{ '--k': k } as CSSProperties}
                        />
                      ))}
                    </span>
                  )}
                </div>

                {trans && trans.effect === 'shatter' && (
                  <div key={`sh-${trans.id}`} className="uv-fx uv-fx--shatter" aria-hidden>
                    <svg className="uv-cracks" viewBox="0 0 100 100" preserveAspectRatio="none">
                      {SHARDS.map((s, i) => (
                        <polygon key={i} points={s.clip.slice(8, -1).replace(/%/g, '')} />
                      ))}
                    </svg>
                    {SHARDS.map((s, i) => (
                      <span
                        key={i}
                        className="uv-shard"
                        style={
                          {
                            clipPath: s.clip,
                            '--dx': `${s.dx}px`,
                            '--dy': `${s.dy}px`,
                            '--rot': `${s.rot}deg`,
                            '--delay': `${s.delay + 260}ms`,
                          } as CSSProperties
                        }
                      >
                        <AlbumCover album={albums[trans.from]} className="uv-fx__cover" />
                      </span>
                    ))}
                  </div>
                )}

                {trans && trans.effect === 'dissolve' && (
                  <div key={`ds-${trans.id}`} className="uv-fx uv-fx--dissolve" aria-hidden>
                    <AlbumCover album={albums[trans.from]} className="uv-fx__cover" />
                  </div>
                )}

                {trans && trans.effect === 'dither' && (
                  <div key={`dt-${trans.id}`} className="uv-fx uv-fx--dither" aria-hidden>
                    <AlbumCover album={albums[trans.from]} className="uv-fx__cover" />
                  </div>
                )}
              </div>

              <div className="uv-focus__meta">
                <span>
                  {pad(focus + 1)} / {pad(n)}
                </span>
                <h2>{album.name}</h2>
                <p>
                  {album.albumType} · {album.market} · {album.releaseDate.replace(/-/g, '.')}
                </p>
                <ol>
                  {album.tracks.map((t) => (
                    <li key={t} className={t === album.titleTrack ? 'is-title' : undefined}>
                      {t}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="uv-focus__nav">
                <button type="button" className="uv-focus__step" aria-label="previous" onClick={() => go(focus - 1, 'slide')}>
                  ←
                </button>
                <span className="uv-focus__count">
                  {pad(focus + 1)} / {pad(n)}
                </span>
                <button type="button" className="uv-focus__step" aria-label="next" onClick={() => go(focus + 1, 'slide')}>
                  →
                </button>
                <button
                  type="button"
                  className={`uv-focus__expand${big ? ' is-on' : ''}`}
                  aria-label={big ? 'shrink' : 'expand'}
                  aria-pressed={big}
                  onClick={toggleBig}
                >
                  <ExpandIcon />
                </button>
                <button type="button" className="uv-focus__close" onClick={closeFocus} aria-label="close detail">
                  <svg viewBox="0 0 12 12" aria-hidden>
                    <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                  close
                </button>
              </div>
            </section>
          )}
        </main>
      )}

      {tab === 'studio' && (
        <main className="uv-studio">
          <HalftoneReel active />
          <div className="uv-studio__copy">
            <p className="uv-studio__intro">
              UNVEIL × ITZY is a small archive for every record the five of them have released. Each album here is
              treated like a project file: a cover, a title track, a running order and a date. Scroll the stack, open
              a record, and let it break apart into the next one.
            </p>
            <dl>
              <dt>Albums</dt>
              <dd>
                <ul className="uv-studio__list">
                  {albums.map((a) => (
                    <li key={a.name}>{a.name}</li>
                  ))}
                </ul>
              </dd>
              <dt>Years</dt>
              <dd>
                <ul className="uv-studio__list">
                  <li>{years}</li>
                  <li>{n} releases</li>
                </ul>
              </dd>
              <dt>Formats</dt>
              <dd className="uv-studio__pills">
                {typeCounts.map(([k, v]) => (
                  <span key={k}>
                    {k}
                    <sup>{pad(v)}</sup>
                  </span>
                ))}
              </dd>
            </dl>
          </div>
        </main>
      )}

      {tab === 'contact' && (
        <main className="uv-contact">
          <p>Say hello —</p>
          <a href="mailto:hello@unveil-itzy.example" className="default-link">
            hello@unveil-itzy.example
          </a>
          <ul>
            <li>
              <Link to="/albums" className="default-link">
                Albums ↗
              </Link>
            </li>
            <li>
              <Link to="/songs" className="default-link">
                Songs ↗
              </Link>
            </li>
            <li>
              <Link to="/works" className="default-link">
                Selected works ↗
              </Link>
            </li>
          </ul>
        </main>
      )}

      <button type="button" className="uv-reel-btn" onClick={() => setReel(true)}>
        <i />
        Play reel
      </button>

      <div className="uv-corner">
        {tab === 'projects' && focus === null ? (
          <>
            <span>{album.name}</span>
            <span>
              {pad(current + 1)} / {pad(n)}
            </span>
          </>
        ) : (
          <span>{tab}</span>
        )}
      </div>

      {reel && (
        <div className="uv-reel" role="dialog" aria-modal onClick={() => setReel(false)}>
          <video src={VIDEO} autoPlay controls playsInline onClick={(e) => e.stopPropagation()} />
          <button type="button" onClick={() => setReel(false)}>
            close
          </button>
        </div>
      )}
    </div>
  );
}
