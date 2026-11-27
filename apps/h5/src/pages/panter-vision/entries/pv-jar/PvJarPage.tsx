import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import MoodOrb, { FINISHES, MOODS, moodOf, type FinishId, type MoodId } from './MoodOrb';
import { JAR_H, JAR_W, MOUTH, ORB_R, SPAWN, layoutInitial, stepBodies, type Body } from './jarPhysics';
import './jar.css';

type Entry = {
  id: string;
  text: string;
  mood: MoodId;
  finish: FinishId;
  at: number;
};
type Tab = 'write' | 'jar';

const TABS: { id: Tab; label: string }[] = [
  { id: 'write', label: '写记忆' },
  { id: 'jar', label: '记忆罐' },
];

const STORAGE_KEY = 'itzy-mood-jar-pv-v1';
const JAR_CAPACITY = 32;
const MAX_LEN = 80;
const PIN_URL = 'https://id.pinterest.com/pin/1137370080945368800/';
const EMOJIS = [
  '😊',
  '😆',
  '😂',
  '🥰',
  '😍',
  '😭',
  '😤',
  '😴',
  '🤔',
  '✨',
  '💖',
  '💜',
  '🎉',
  '🌈',
  '🍀',
  '⭐',
  '🔥',
  '👏',
  '🙏',
  '🎧',
];
const FLY_ORB = 72;

const loadEntries = (): Entry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? (JSON.parse(raw) as Entry[]) : [];
    return Array.isArray(list) ? list.filter((e) => e && typeof e.text === 'string' && e.id) : [];
  } catch {
    return [];
  }
};

const formatTime = (at: number) => {
  const d = new Date(at);
  const today = new Date();
  const hm = d.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return d.toDateString() === today.toDateString() ? `今天 ${hm}` : `${d.getMonth() + 1}/${d.getDate()} ${hm}`;
};

const seedOf = (id: string) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return (h % 1000) / 1000;
};

const easeInOut = (u: number) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);

type Flight = {
  entry: Entry;
  from: DOMRect;
  to: { x: number; y: number };
  endSize: number;
};

/** 纸条揉成光球 → 沿抛物线飞进罐口 */
function NoteFlight({ flight, onOpenLid, onArrive }: { flight: Flight; onOpenLid: () => void; onArrive: () => void }) {
  const noteRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const burstRef = useRef<HTMLDivElement>(null);
  const cbs = useRef({ onOpenLid, onArrive });
  cbs.current = { onOpenLid, onArrive };

  useLayoutEffect(() => {
    const note = noteRef.current!;
    const orb = orbRef.current!;
    const burst = burstRef.current!;
    const { from, to, endSize } = flight;
    const sx = from.left + from.width / 2;
    const sy = from.top + from.height / 2 - 40;
    for (const el of [note, orb, burst]) {
      el.style.left = `${sx}px`;
      el.style.top = `${sy}px`;
    }
    const base = 'translate(-50%, -50%)';
    const crumple = 1500;
    const anims: Animation[] = [];
    anims.push(
      note.animate(
        [
          {
            transform: `${base} translateY(36px) scale(.7) rotate(-5deg)`,
            opacity: 0,
            borderRadius: '6px',
          },
          {
            transform: `${base} scale(1) rotate(-2deg)`,
            opacity: 1,
            borderRadius: '6px',
            offset: 0.18,
          },
          {
            transform: `${base} scale(1) rotate(2deg)`,
            opacity: 1,
            borderRadius: '6px',
            offset: 0.4,
          },
          {
            transform: `${base} scale(.8, .46) rotate(9deg)`,
            opacity: 1,
            borderRadius: '22px',
            offset: 0.6,
          },
          {
            transform: `${base} scale(.3) rotate(190deg)`,
            opacity: 0.9,
            borderRadius: '50%',
            filter: 'blur(1px)',
            offset: 0.8,
          },
          {
            transform: `${base} scale(.12) rotate(320deg)`,
            opacity: 0,
            borderRadius: '50%',
            filter: 'blur(4px)',
          },
        ],
        {
          duration: crumple,
          easing: 'cubic-bezier(.45,0,.25,1)',
          fill: 'forwards',
        },
      ),
    );
    anims.push(
      orb.animate(
        [
          { transform: `${base} scale(0)`, opacity: 0 },
          { transform: `${base} scale(0)`, opacity: 0, offset: 0.72 },
          { transform: `${base} scale(1.28)`, opacity: 1, offset: 0.86 },
          { transform: `${base} scale(1)`, opacity: 1 },
        ],
        { duration: crumple, easing: 'ease-out', fill: 'forwards' },
      ),
    );
    anims.push(
      burst.animate(
        [
          { transform: `${base} scale(.2)`, opacity: 0 },
          { transform: `${base} scale(.2)`, opacity: 0, offset: 0.74 },
          { transform: `${base} scale(1)`, opacity: 0.9, offset: 0.84 },
          { transform: `${base} scale(1.9)`, opacity: 0 },
        ],
        { duration: crumple, easing: 'ease-out', fill: 'forwards' },
      ),
    );

    let cancelled = false;
    anims[0].finished
      .then(() => {
        if (cancelled) return;
        cbs.current.onOpenLid();
        const dx = to.x - sx;
        const dy = to.y - sy;
        const lift = Math.min(sy, to.y) - sy - 150;
        const endScale = endSize / FLY_ORB;
        const frames: Keyframe[] = [];
        const N = 20;
        for (let i = 0; i <= N; i++) {
          const u = easeInOut(i / N);
          const x = 2 * (1 - u) * u * (dx / 2) + u * u * dx;
          const y = 2 * (1 - u) * u * lift + u * u * dy;
          const s = 1 + (endScale - 1) * u;
          frames.push({
            transform: `${base} translate(${x}px, ${y}px) scale(${s})`,
          });
        }
        const fly = orb.animate(frames, {
          duration: 820,
          easing: 'linear',
          fill: 'forwards',
        });
        anims.push(fly);
        return fly.finished;
      })
      .then(() => {
        if (!cancelled) cbs.current.onArrive();
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
      anims.forEach((a) => a.cancel());
    };
  }, [flight]);

  const mood = moodOf(flight.entry.mood);
  return (
    <div className="jar-flight" aria-hidden>
      <div ref={noteRef} className="jar-note">
        <span className="jar-note__tag" style={{ background: mood.color }}>
          {mood.en}
        </span>
        <p>{flight.entry.text}</p>
        <small>{formatTime(flight.entry.at)}</small>
      </div>
      <div ref={burstRef} className="jar-burst" style={{ ['--c' as string]: mood.color }} />
      <div ref={orbRef} className="jar-flight__orb">
        <MoodOrb mood={flight.entry.mood} finish={flight.entry.finish} size={FLY_ORB} />
      </div>
    </div>
  );
}

export default function PvJarPage() {
  const [entries, setEntries] = useState<Entry[]>(loadEntries);
  const [text, setText] = useState('');
  const [mood, setMood] = useState<MoodId>('good');
  const [finish, setFinish] = useState<FinishId>('glass');
  const [flight, setFlight] = useState<Flight | null>(null);
  const [lidOpen, setLidOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [tab, setTab] = useState<Tab>('write');
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState<Entry | null>(null);
  const [expanded, setExpanded] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const jarRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLElement>(null);
  const bodies = useRef(new Map<string, Body>());
  const orbEls = useRef(new Map<string, HTMLElement>());

  useEffect(() => {
    const body = document.body;
    const prev = {
      overflow: body.style.overflow,
      bg: body.style.background,
      height: body.style.height,
    };
    body.style.overflow = 'auto';
    body.style.height = 'auto';
    body.style.background = '#e7edf3';
    return () => {
      body.style.overflow = prev.overflow;
      body.style.height = prev.height;
      body.style.background = prev.bg;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-200)));
    } catch {
      /* 存储已满时忽略 */
    }
  }, [entries]);

  useLayoutEffect(() => {
    const el = jarRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      if (el.clientWidth > 0) setScale(el.clientWidth / JAR_W);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 罐子在提交后才显示，需等它布局完成再计算飞行起止点
  useLayoutEffect(() => {
    const el = jarRef.current;
    if (!pending || !el) return;
    const rect = el.getBoundingClientRect();
    const s = rect.width / JAR_W;
    setFlight({
      entry: pending,
      from: rect,
      to: { x: rect.left + MOUTH.x * s, y: rect.top + MOUTH.y * s },
      endSize: ORB_R * 2 * s,
    });
    setPending(null);
  }, [pending]);

  useEffect(() => {
    if (expanded) listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [expanded]);

  const pendingId = pending?.id ?? flight?.entry.id;
  const inJar = useMemo(() => entries.filter((e) => e.id !== pendingId).slice(-JAR_CAPACITY), [entries, pendingId]);

  // 首次进入：一次性码好已有光球；之后只同步删除被挤出罐子的
  const initialised = useRef(false);
  if (!initialised.current) {
    initialised.current = true;
    layoutInitial(inJar.map((e) => e.id)).forEach((b) => bodies.current.set(b.id, b));
  }
  useEffect(() => {
    const keep = new Set(inJar.map((e) => e.id));
    for (const id of [...bodies.current.keys()]) if (!keep.has(id)) bodies.current.delete(id);
  }, [inJar]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      const list = [...bodies.current.values()];
      stepBodies(list, dt);
      for (const b of list) {
        const el = orbEls.current.get(b.id);
        if (el) el.style.transform = `translate(${b.x - b.r}px, ${b.y - b.r}px)`;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const bindOrb = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      if (!el) {
        orbEls.current.delete(id);
        return;
      }
      orbEls.current.set(id, el);
      const b = bodies.current.get(id);
      if (b) el.style.transform = `translate(${b.x - b.r}px, ${b.y - b.r}px)`;
    },
    [],
  );

  const insertEmoji = (emoji: string) => {
    const el = inputRef.current;
    const start = el?.selectionStart ?? text.length;
    const end = el?.selectionEnd ?? text.length;
    const next = (text.slice(0, start) + emoji + text.slice(end)).slice(0, MAX_LEN);
    setText(next);
    requestAnimationFrame(() => {
      el?.focus();
      const pos = Math.min(start + emoji.length, next.length);
      el?.setSelectionRange(pos, pos);
    });
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value || flight || pending) return;
    const entry: Entry = {
      id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      text: value,
      mood,
      finish,
      at: Date.now(),
    };
    window.scrollTo(0, 0);
    setSent(true);
    setPending(entry);
    setEntries((list) => [...list, entry]);
    setText('');
  };

  const writeAnother = () => {
    setSent(false);
    setSelected(null);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const switchTab = (next: Tab) => {
    if (next === tab) return;
    setTab(next);
    setSelected(null);
    if (next === 'write') setExpanded(false);
    window.scrollTo(0, 0);
  };

  const onArrive = useCallback(() => {
    setFlight((f) => {
      if (f) {
        bodies.current.set(f.entry.id, {
          id: f.entry.id,
          x: SPAWN.x + (Math.random() - 0.5) * 10,
          y: SPAWN.y,
          vx: (Math.random() - 0.5) * 60,
          vy: 260,
          r: ORB_R,
        });
      }
      return null;
    });
    window.setTimeout(() => setLidOpen(false), 450);
  }, []);

  const remove = (id: string) => {
    setEntries((list) => list.filter((e) => e.id !== id));
    if (selected === id) setSelected(null);
  };

  const selectedEntry = entries.find((e) => e.id === selected) ?? null;
  const allEntries = [...entries].reverse();
  const busy = !!flight || !!pending;
  const showJar = tab === 'jar' || sent;

  return (
    <div className="jar-page">
      <Link to="/panter-vision" className="jar-back">
        ← Menu
      </Link>

      <div
        className="jar-switch"
        role="tablist"
        aria-label="页面切换"
        data-tab={tab}
        style={{ ['--c' as string]: moodOf(mood).color }}
      >
        <span className="jar-switch__thumb" aria-hidden />
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={tab === t.id ? 'is-on' : ''}
            disabled={busy}
            onClick={() => switchTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <header className="jar-head">
        <h1>MIDZY 心情罐</h1>
        <p>{tab === 'write' ? '写一张小纸条，它会揉成一颗发光球落进罐子里' : '每一颗光球里都藏着一段记忆'}</p>
      </header>

      <section className="jar-scene" hidden={!showJar}>
        {tab === 'jar' && (
          <button
            type="button"
            className="jar-expand"
            aria-expanded={expanded}
            disabled={entries.length === 0}
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? '收起记忆' : '展开所有记忆'}
            <span aria-hidden>{expanded ? '↑' : '↓'}</span>
          </button>
        )}
        <div ref={jarRef} className="jar" style={{ height: JAR_H * scale }}>
          <div className="jar__stage" style={{ transform: `scale(${scale})` }}>
            <div className="jar__shadow" />
            <svg className="jar__glass jar__glass--back" viewBox={`0 0 ${JAR_W} ${JAR_H}`} aria-hidden>
              <defs>
                <linearGradient id="jar-back" x1="0" x2="1">
                  <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
                  <stop offset="0.5" stopColor="#f3f8fc" stopOpacity="0.25" />
                  <stop offset="1" stopColor="#ffffff" stopOpacity="0.5" />
                </linearGradient>
              </defs>
              <path className="jar__body" d={JAR_PATH} fill="url(#jar-back)" />
            </svg>

            <div className="jar__orbs">
              {inJar.map((e) => (
                <button
                  key={e.id}
                  ref={bindOrb(e.id)}
                  type="button"
                  className={`jar__orb${selected === e.id ? ' is-selected' : ''}`}
                  onClick={() => setSelected((s) => (s === e.id ? null : e.id))}
                  aria-label={`${moodOf(e.mood).label}：${e.text}`}
                >
                  <MoodOrb mood={e.mood} finish={e.finish} size={ORB_R * 2} seed={seedOf(e.id)} />
                </button>
              ))}
            </div>

            <svg className="jar__glass jar__glass--front" viewBox={`0 0 ${JAR_W} ${JAR_H}`} aria-hidden>
              <path d={JAR_PATH} fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="3" />
              <path
                d={JAR_PATH}
                fill="none"
                stroke="rgba(120,140,160,0.25)"
                strokeWidth="1"
                transform="translate(0 1.5)"
              />
              <path
                d="M52 170 C46 220 46 300 56 350"
                fill="none"
                stroke="rgba(255,255,255,0.85)"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                d="M70 160 C66 175 65 185 65 196"
                fill="none"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d="M272 190 C276 240 275 290 268 330"
                fill="none"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <ellipse cx="160" cy="386" rx="92" ry="6" fill="rgba(255,255,255,0.45)" />
            </svg>

            <div className="jar__label">
              <strong>US?</strong>
            </div>

            <div className={`jar__lid${lidOpen ? ' is-open' : ''}`} />
          </div>
        </div>
      </section>
      {showJar && (
        <p className="jar-count">
          {tab === 'write' && busy ? (
            '纸条正在变成光球…'
          ) : (
            <>
              罐子里有 <strong>{inJar.length}</strong> 颗光球 · 点一颗看看里面写了什么
            </>
          )}
        </p>
      )}

      {showJar && selectedEntry && (
        <div className="jar-peek" role="status">
          <MoodOrb mood={selectedEntry.mood} finish={selectedEntry.finish} size={44} />
          <div>
            <strong>{moodOf(selectedEntry.mood).label}</strong>
            <p>{selectedEntry.text}</p>
            <small>{formatTime(selectedEntry.at)}</small>
          </div>
          <button type="button" onClick={() => setSelected(null)} aria-label="关闭">
            ×
          </button>
        </div>
      )}

      {tab === 'write' && sent && (
        <button type="button" className="jar-again" disabled={busy} onClick={writeAnother}>
          ✎ 再写一条
        </button>
      )}

      {tab === 'write' && !sent && (
        <>
          <section className="jar-card jar-moods" aria-label="选择心情">
            {MOODS.map((m) => (
              <button
                key={m.id}
                type="button"
                className={mood === m.id ? 'is-on' : ''}
                onClick={() => setMood(m.id)}
                aria-pressed={mood === m.id}
              >
                <MoodOrb mood={m.id} finish={finish} size={42} />
                <span>{m.en}</span>
              </button>
            ))}
          </section>

          <form className="jar-card jar-form" onSubmit={submit}>
            <div className="jar-form__top">
              <div className="jar-form__preview" aria-hidden>
                <MoodOrb mood={mood} finish={finish} size={76} seed={0.3} />
              </div>
              <div className="jar-form__finish" role="radiogroup" aria-label="光球质感">
                {FINISHES.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    role="radio"
                    aria-checked={finish === f.id}
                    className={finish === f.id ? 'is-on' : ''}
                    onClick={() => setFinish(f.id)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              ref={inputRef}
              value={text}
              maxLength={MAX_LEN}
              rows={3}
              placeholder="写下此刻的心情，或想对 ITZY 说的话…"
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit(e);
              }}
            />
            <div className="jar-form__emoji" aria-label="插入表情">
              {EMOJIS.map((em) => (
                <button key={em} type="button" onClick={() => insertEmoji(em)}>
                  {em}
                </button>
              ))}
            </div>
            <div className="jar-form__foot">
              <span>
                {[...text].length}/{MAX_LEN}
              </span>
              <button type="submit" disabled={!text.trim() || busy}>
                折成光球放进罐子
              </button>
            </div>
          </form>
        </>
      )}

      {tab === 'jar' && expanded && entries.length > 0 && (
        <section
          ref={listRef}
          className="jar-card jar-list"
          aria-label="所有记忆"
        >
          <h2 className="jar-list__title">
            全部记忆 <span>{entries.length}</span>
          </h2>
          {allEntries.map((e, i) => (
            <article
              key={e.id}
              className={selected === e.id ? 'is-selected' : ''}
              style={{ animationDelay: `${Math.min(i, 12) * 40}ms` }}
              onClick={() => setSelected((s) => (s === e.id ? null : e.id))}
            >
              <MoodOrb mood={e.mood} finish={e.finish} size={36} />
              <div>
                <strong>{moodOf(e.mood).en}</strong>
                <p>{e.text}</p>
                <small>{formatTime(e.at)}</small>
              </div>
              <button
                type="button"
                onClick={(ev) => {
                  ev.stopPropagation();
                  remove(e.id);
                }}
                aria-label="删除这张纸条"
              >
                ···
              </button>
            </article>
          ))}
        </section>
      )}

      <p className="jar-ref">
        交互参考{' '}
        <a href={PIN_URL} target="_blank" rel="noreferrer">
          Pinterest · Track Your Feelings Daily ↗
        </a>
        ，纸条只保存在本机浏览器。
      </p>

      {flight && <NoteFlight flight={flight} onOpenLid={() => setLidOpen(true)} onArrive={onArrive} />}
    </div>
  );
}

const JAR_PATH =
  'M95 52 L225 52 L225 78 C225 102 290 106 290 152 L290 340 Q290 400 230 400 L90 400 Q30 400 30 340 L30 152 C30 106 95 102 95 78 Z';
