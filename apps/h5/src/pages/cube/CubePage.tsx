import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { createRubikScene, type RubikSceneHandle } from './createRubikScene';
import './cube.css';

const PIN_ID = '782641241511471095';
const PIN_URL = `https://id.pinterest.com/pin/${PIN_ID}/`;

const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 28" aria-hidden>
      <path d="M16 27C7 20 1 15 1 8.5 1 4.4 4.2 1 8.3 1c3 0 5.6 1.8 7.7 4.6C18.1 2.8 20.7 1 23.7 1 27.8 1 31 4.4 31 8.5 31 15 25 20 16 27Z" />
    </svg>
  );
}

function HookArrow({ className, flip }: { className?: string; flip?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 64 40" aria-hidden style={flip ? { transform: 'scaleX(-1)' } : undefined}>
      <path
        d="M4 6h42a12 12 0 0 1 0 24H30M37 22l-7 8 7 8"
        fill="none"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IsoCubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 52" aria-hidden>
      <path d="M24 2 45 14v24L24 50 3 38V14Z" fill="none" strokeWidth="3" strokeLinejoin="round" />
      <path d="M3 14l21 12 21-12M24 26v24" fill="none" strokeWidth="3" strokeLinejoin="round" />
      <path d="M13.5 8l21 12M34.5 8l-21 12M13.5 32v12M34.5 32v12" fill="none" strokeWidth="2" />
    </svg>
  );
}

export default function CubePage() {
  const hostRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<RubikSceneHandle | null>(null);
  const [auto, setAuto] = useState(() => !prefersReducedMotion());
  const [exploded, setExploded] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prev = {
      html: html.style.overflow,
      body: body.style.overflow,
      height: body.style.height,
      bg: body.style.background,
    };
    html.style.overflow = 'visible';
    body.style.overflowX = 'hidden';
    body.style.overflowY = 'auto';
    body.style.height = 'auto';
    body.style.background = '#d9d9d9';
    return () => {
      html.style.overflow = prev.html;
      body.style.overflow = prev.body;
      body.style.height = prev.height;
      body.style.background = prev.bg;
    };
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const scene = createRubikScene({
      container: host,
      dprCap: 1.75,
      autoRotate: auto,
      onHistoryChange: setMoves,
    });
    sceneRef.current = scene;
    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => sceneRef.current?.setAuto(auto), [auto]);
  useEffect(() => sceneRef.current?.setExploded(exploded), [exploded]);
  useEffect(() => sceneRef.current?.setSpeed(speed), [speed]);

  const solve = () => {
    setAuto(false);
    sceneRef.current?.solve();
  };

  return (
    <div className="cube-page">
      <Link to="/menu" className="cube-back">
        ← Menu
      </Link>

      <section className="cube-poster" aria-label="ITZY 魔方海报">
        <header className="cube-poster__bar">
          <div className="cube-poster__bar-cell cube-poster__bar-title">
            ALL IN
            <br />
            US
          </div>
          <div className="cube-poster__bar-cell cube-poster__bar-info">
            <strong>
              MIDZY <em>NEW WAVE</em>
            </strong>
            <span>CUBE EDITION</span>
            <small>Five members, six faces, endless turns.</small>
          </div>
          <div className="cube-poster__bar-cell cube-poster__bar-logo">
            <HeartIcon className="cube-poster__bar-heart" />
            <span>
              itzy
              <small>cube lab</small>
            </span>
          </div>
        </header>

        <HeartIcon className="cube-poster__heart" />
        <HookArrow className="cube-poster__hook" />

        <p className="cube-poster__kicker">
          MIDZY&apos;S
          <br />
          CUBE DAY
        </p>

        <h1 className="cube-poster__headline">
          <span>ALL IN</span>
          <span>US</span>
        </h1>

        <div className="cube-poster__bottom-title">
          <p className="cube-poster__brand">ITZY</p>
          <div className="cube-poster__year">
            <strong>2026</strong>
            <span>
              KEEP
              <br />
              TURNING
            </span>
          </div>
          <p className="cube-poster__tagline">FIVE COLORS, ONE CUBE</p>
          <p className="cube-poster__tagline-cn">一起转动 · 拼回我们</p>
        </div>

        <footer className="cube-poster__footer">
          <div className="cube-poster__footer-left">
            <HookArrow className="cube-poster__footer-hook" flip />
            <strong>
              CUBE MAKER
              <br />
              PARTY
            </strong>
          </div>
          <small className="cube-poster__footer-fine">DRAG TO SPIN · TAP BELOW TO SHUFFLE OR SOLVE</small>
          <div className="cube-poster__footer-right">
            <span className="cube-poster__footer-cn">魔方局</span>
            <IsoCubeIcon className="cube-poster__footer-cube" />
          </div>
        </footer>

        <div ref={hostRef} className="cube-poster__stage" aria-label="3D 魔方，可拖拽旋转" />
      </section>

      <div className="cube-controls" role="toolbar" aria-label="魔方控制">
        <button type="button" className={auto ? 'is-on' : ''} onClick={() => setAuto((v) => !v)}>
          {auto ? '暂停演示' : '自动演示'}
        </button>
        <button
          type="button"
          onClick={() => {
            setAuto(false);
            sceneRef.current?.scramble(20);
          }}
        >
          打乱 ×20
        </button>
        <button type="button" onClick={solve} disabled={moves === 0}>
          复原
        </button>
        <button type="button" className={exploded ? 'is-on' : ''} onClick={() => setExploded((v) => !v)}>
          {exploded ? '合拢' : '展开'}
        </button>
        <label className="cube-controls__speed">
          速度
          <input
            type="range"
            min={0.25}
            max={3}
            step={0.25}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span>{speed.toFixed(2)}×</span>
        </label>
        <span className="cube-controls__count">已转 {moves} 步</span>
      </div>

      <section className="cube-ref">
        <div className="cube-ref__text">
          <h2>参考视频</h2>
          <p>通过 Pinterest 官方嵌入组件播放，版权归原作者所有。本页版式与图案为 ITZY 主题重新设计。</p>
          <a href={PIN_URL} target="_blank" rel="noreferrer">
            在 Pinterest 查看原 Pin ↗
          </a>
        </div>
        <div className="cube-ref__embed">
          <iframe
            src={`https://assets.pinterest.com/ext/embed.html?id=${PIN_ID}`}
            title="Pinterest 参考视频"
            loading="lazy"
            scrolling="no"
            frameBorder={0}
            allowFullScreen
          />
        </div>
      </section>
    </div>
  );
}
