import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { ALBUMS, type AlbumEntry } from '@/pages/songs/songsData';
import AlbumCover from './AlbumCover';
import './albums.css';

type Scroller = { cur: number; target: number; max: number };

const N = ALBUMS.length;
const LARGE_QUERY = '(min-width: 860px) and (min-aspect-ratio: 1/1)';
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const titleIndex = (a: AlbumEntry) => {
  const t = a.titleTrack.toLowerCase();
  const i = a.tracks.findIndex((s) => s.toLowerCase().startsWith(t));
  return i < 0 ? 0 : i;
};

const metaOf = (a: AlbumEntry) => `${a.releaseDate.replace(/-/g, '.')} · ${a.market}${a.albumType}专辑 · ${a.tracks.length} 首`;

const useMedia = (query: string) => {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return match;
};

export default function PvAlbumsPage() {
  const large = useMedia(LARGE_QUERY);
  const stageRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 1200, h: 800 });
  const [, setFrame] = useState(0);
  const [sheet, setSheet] = useState(false);

  const start = Math.floor(N / 2);
  const albumS = useRef<Scroller>({ cur: start, target: start, max: N - 1 });
  const trackS = useRef<Scroller>({ cur: 0, target: 0, max: 0 });
  const snapTimers = useRef(new Map<Scroller, number>());

  const active = clamp(Math.round(albumS.current.cur), 0, N - 1);
  const album = ALBUMS[active];
  const trackIdx = clamp(Math.round(trackS.current.cur), 0, album.tracks.length - 1);

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 切换专辑后，左侧曲目重置到主打曲
  useLayoutEffect(() => {
    const ti = titleIndex(album);
    trackS.current = { cur: ti, target: ti, max: album.tracks.length - 1 };
  }, [album]);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      let moved = false;
      for (const s of [albumS.current, trackS.current]) {
        const diff = s.target - s.cur;
        if (diff === 0) continue;
        s.cur = Math.abs(diff) < 0.001 ? s.target : s.cur + diff * 0.16;
        moved = true;
      }
      if (moved) setFrame((f) => (f + 1) % 1e6);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const nudge = (s: Scroller, delta: number, snapDelay = 160) => {
    s.target = clamp(s.target + delta, 0, s.max);
    const timers = snapTimers.current;
    window.clearTimeout(timers.get(s));
    timers.set(
      s,
      window.setTimeout(() => {
        s.target = Math.round(s.target);
      }, snapDelay),
    );
  };

  const goTo = (s: Scroller, i: number) => {
    window.clearTimeout(snapTimers.current.get(s));
    s.target = clamp(i, 0, s.max);
  };

  // 大屏：右半区滚轮切专辑，左半区滚轮切曲目；小屏：整屏切专辑
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (sheet) return;
      e.preventDefault();
      const raw = e.deltaMode === 1 ? e.deltaY * 33 : e.deltaY;
      const delta = clamp(raw / 100, -1, 1);
      const rect = el.getBoundingClientRect();
      const onLeft = large && e.clientX - rect.left < rect.width * 0.5;
      nudge(onLeft ? trackS.current : albumS.current, delta);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [large, sheet]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSheet(false);
      if (sheet) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') goTo(albumS.current, Math.round(albumS.current.target) + 1);
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') goTo(albumS.current, Math.round(albumS.current.target) - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sheet]);

  // 小屏：上下拖动转动转盘
  const drag = useRef<{ y: number; from: number; moved: boolean } | null>(null);
  const dragMoved = useRef(false);
  const dragStep = size.h * 0.13;
  const onPointerDown = (e: PointerEvent) => {
    dragMoved.current = false;
    if (large || e.pointerType === 'mouse') return;
    drag.current = { y: e.clientY, from: albumS.current.target, moved: false };
  };
  const onPointerMove = (e: PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dy = e.clientY - d.y;
    if (Math.abs(dy) > 6) d.moved = true;
    albumS.current.target = clamp(d.from - dy / dragStep, 0, N - 1);
  };
  const onPointerUp = () => {
    if (!drag.current) return;
    dragMoved.current = drag.current.moved;
    drag.current = null;
    albumS.current.target = Math.round(albumS.current.target);
  };
  const tapGuard = () => !dragMoved.current;

  return (
    <div
      ref={stageRef}
      className={`albums ${large ? 'albums--large' : 'albums--small'}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <Link to="/panter-vision" className="albums__back" aria-label="返回 Panter Vision">
        ←
      </Link>

      {large ? (
        <LargeView
          size={size}
          album={album}
          active={active}
          albumPos={albumS.current.cur}
          trackPos={trackS.current.cur}
          trackIdx={trackIdx}
          onPickAlbum={(i) => goTo(albumS.current, i)}
          onPickTrack={(j) => goTo(trackS.current, j)}
          onOpenSheet={() => setSheet(true)}
        />
      ) : (
        <SmallView
          size={size}
          albumPos={albumS.current.cur}
          onPickAlbum={(i) => tapGuard() && goTo(albumS.current, i)}
          onOpenSheet={() => tapGuard() && setSheet(true)}
        />
      )}

      {sheet && (
        <div className="albums-sheet" role="dialog" aria-label={`${album.name} 曲目`} onClick={() => setSheet(false)}>
          <div className="albums-sheet__card" onClick={(e) => e.stopPropagation()}>
            <div className="albums-sheet__head">
              <AlbumCover album={album} className="albums-sheet__cover" />
              <div>
                <h2>{album.name}</h2>
                <p>{metaOf(album)}</p>
              </div>
              <button type="button" onClick={() => setSheet(false)} aria-label="关闭">
                ×
              </button>
            </div>
            <ol>
              {album.tracks.map((t, j) => (
                <li key={t}>
                  <button
                    type="button"
                    className={large && j === trackIdx ? 'is-on' : ''}
                    onClick={() => {
                      goTo(trackS.current, j);
                      setSheet(false);
                    }}
                  >
                    <span>{String(j + 1).padStart(2, '0')}</span>
                    {t}
                    {j === titleIndex(album) && <em>TITLE</em>}
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

type LargeProps = {
  size: { w: number; h: number };
  album: AlbumEntry;
  active: number;
  albumPos: number;
  trackPos: number;
  trackIdx: number;
  onPickAlbum: (i: number) => void;
  onPickTrack: (j: number) => void;
  onOpenSheet: () => void;
};

function LargeView({ size, album, active, albumPos, trackPos, trackIdx, onPickAlbum, onPickTrack, onOpenSheet }: LargeProps) {
  const { w, h } = size;
  const cy = h * 0.5;

  // 左侧曲目：圆心在屏幕左外侧，中间留出给深色方块
  const RL = h * 0.66;
  const cxL = w * 0.075 - RL;
  const wordSize = clamp(h * 0.042, 18, 34);

  // 右侧封面：圆心在屏幕右外侧
  const RR = h * 0.68;
  const cxR = w * 0.81 + RR;
  const cover = clamp(Math.min(h * 0.14, w * 0.09), 64, 130);

  const panelH = Math.min(h * 0.25, w * 0.14);
  const panelLeft = w * 0.19;
  const panelRight = w * 0.81 - cover * 0.8 - 24;
  const track = album.tracks[trackIdx];

  return (
    <>
      <header className="albums-logo">
        <strong>itzy</strong>
        <span>ALBUMS</span>
        <small>by MIDZY</small>
      </header>

      <span className="albums-edge albums-edge--left">TRACKS</span>
      <span className="albums-edge albums-edge--right">ALBUMS</span>

      <div className="albums-words" key={album.name} style={{ fontSize: wordSize }}>
        {album.tracks.map((t, j) => {
          const d = j - trackPos;
          const th = d * 0.165 + clamp(d, -1, 1) * 0.1;
          if (Math.abs(th) > 1.25) return null;
          const x = cxL + RL * Math.cos(th);
          const y = cy + RL * Math.sin(th);
          const fade = clamp(1 - Math.abs(d) / 5.5, 0, 1) * clamp((Math.abs(d) - 0.2) / 0.5, 0, 1);
          return (
            <button
              key={`${t}-${j}`}
              type="button"
              className="albums-word"
              style={{
                transform: `translate(${x}px, ${y}px) rotate(${th}rad) translateY(-50%)`,
                opacity: fade,
                pointerEvents: fade < 0.2 ? 'none' : undefined,
                maxWidth: w * 0.26,
              }}
              onClick={() => onPickTrack(j)}
            >
              {t}
            </button>
          );
        })}
      </div>

      <section
        className="albums-panel"
        style={{ left: panelLeft, width: panelRight - panelLeft, height: panelH, ['--ph' as string]: `${panelH}px` }}
      >
        <div className="albums-panel__square">
          <span key={track} style={{ fontSize: panelH * (track.length > 12 ? 0.075 : 0.11) }}>
            {track}
          </span>
        </div>
        <div className="albums-panel__card">
          <h1 key={album.name}>{album.name}</h1>
          <p>
            {metaOf(album)}
            <br />
            主打 · {album.titleTrack}
          </p>
          <div className="albums-panel__rule" />
          <button type="button" onClick={onOpenSheet}>
            VIEW TRACKS
          </button>
        </div>
        <div className="albums-panel__collage" key={album.name}>
          {[1, 2, 3, 0].map((v) => (
            <AlbumCover key={v} album={album} variant={v} label={v === 0} />
          ))}
        </div>
      </section>

      <div className="albums-covers">
        {ALBUMS.map((a, i) => {
          const d = i - albumPos;
          const th = d * 0.24 + clamp(d, -1, 1) * 0.08;
          if (Math.abs(th) > 1.45) return null;
          const x = cxR - RR * Math.cos(th);
          const y = cy + RR * Math.sin(th);
          const near = Math.max(0, 1 - Math.abs(d));
          const s = 1 + near * 0.32;
          const tilt = -th * 38 + ((i * 37) % 11) - 5;
          return (
            <button
              key={a.name}
              type="button"
              className={`albums-cover${i === active ? ' is-active' : ''}`}
              style={{
                width: cover,
                height: cover,
                transform: `translate(${x - cover / 2}px, ${y - cover / 2}px) rotate(${tilt * (1 - near)}deg) scale(${s})`,
                opacity: clamp(1.25 - Math.abs(d) / 5, 0, 1),
                zIndex: 100 - Math.round(Math.abs(d) * 10),
              }}
              onClick={() => onPickAlbum(i)}
              aria-label={a.name}
            >
              <AlbumCover album={a} />
            </button>
          );
        })}
      </div>

      <footer className="albums-foot">
        <span className="albums-foot__dial" aria-hidden>
          ✣
        </span>
        <span>
          {String(active + 1).padStart(2, '0')} / {N} · 右侧滚轮切换专辑 · 左侧滚轮切换曲目
        </span>
      </footer>
    </>
  );
}

type SmallProps = {
  size: { w: number; h: number };
  albumPos: number;
  onPickAlbum: (i: number) => void;
  onOpenSheet: () => void;
};

function SmallView({ size, albumPos, onPickAlbum, onOpenSheet }: SmallProps) {
  const { w, h } = size;
  const R = h * 0.95;
  const pad = 18;
  const cx = pad + R;
  const cy = h * 0.53;
  const disc = clamp(w * 0.17, 54, 78);

  return (
    <>
      <header className="albums-sbar">
        <h1>Albums</h1>
        <span aria-hidden>···</span>
      </header>
      <span className="albums-edge albums-edge--right">COLLECTION</span>

      <div className="albums-wheel">
        {ALBUMS.map((a, i) => {
          const d = i - albumPos;
          const phi = d * 0.145 + clamp(d, -1, 1) * 0.05;
          if (Math.abs(phi) > 0.95) return null;
          const x = cx - R * Math.cos(phi);
          const y = cy + R * Math.sin(phi);
          const act = Math.max(0, 1 - Math.abs(d) * 1.6);
          return (
            <div
              key={a.name}
              className={`albums-row${act > 0.5 ? ' is-active' : ''}`}
              style={
                {
                  width: w - pad * 2,
                  transform: `translate(${x}px, ${y}px) rotate(${-phi}rad) translateY(-50%)`,
                  opacity: clamp(1.2 - Math.abs(d) / 3.6, 0, 1),
                  zIndex: 100 - Math.round(Math.abs(d) * 10),
                  '--act': act,
                } as CSSProperties
              }
              onClick={() => onPickAlbum(i)}
            >
              <AlbumCover album={a} round label={false} style={{ width: disc, height: disc }} />
              <div className="albums-row__text">
                <strong>{a.name}</strong>
                <span>
                  {a.releaseDate.slice(0, 4)} · {a.titleTrack}
                </span>
              </div>
              <button
                type="button"
                tabIndex={act > 0.5 ? 0 : -1}
                onClick={(e) => {
                  e.stopPropagation();
                  if (act > 0.5) onOpenSheet();
                  else onPickAlbum(i);
                }}
              >
                Tracks
              </button>
            </div>
          );
        })}
      </div>

      <footer className="albums-foot">上下滑动切换专辑</footer>
    </>
  );
}
