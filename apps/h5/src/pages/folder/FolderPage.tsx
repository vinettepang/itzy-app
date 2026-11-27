import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { createFolderScene, FOLDER_ITEMS, type FolderSceneHandle, type FolderState } from './createFolderScene';
import './folder.css';

const PIN_ID = '968625832377852354';
const PIN_URL = `https://id.pinterest.com/pin/${PIN_ID}/`;

const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;

const STATE_LABEL: Record<FolderState, string> = {
  closed: '已合上',
  open: '已打开',
  fan: '全部飞出',
  focus: '查看物件',
};

export default function FolderPage() {
  const hostRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<FolderSceneHandle | null>(null);
  const [auto, setAuto] = useState(() => !prefersReducedMotion());
  const [state, setState] = useState<FolderState>('closed');
  const [focus, setFocus] = useState(0);

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
    body.style.background = '#f3e9f5';
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
    const scene = createFolderScene({
      container: host,
      dprCap: 1.75,
      autoPlay: auto,
      onStateChange: (s, f) => {
        setState(s);
        setFocus(f);
      },
      onUserInteract: () => setAuto(false),
    });
    sceneRef.current = scene;
    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => sceneRef.current?.setAuto(auto), [auto]);

  const manual = (fn: (s: FolderSceneHandle) => void) => {
    setAuto(false);
    if (sceneRef.current) fn(sceneRef.current);
  };

  return (
    <div className="folder-page">
      <Link to="/menu" className="folder-back">
        ← Menu
      </Link>

      <section className="folder-stage" aria-label="ITZY 3D 文件夹">
        <div className="folder-stage__glow" aria-hidden />
        <header className="folder-stage__head">
          <span className="folder-stage__pill">itzy.</span>
          <span className="folder-stage__meta">
            MIDZY ARCHIVE
            <br />
            VOL.05 · 2026
          </span>
        </header>
        <p className="folder-stage__title">
          OPEN
          <br />
          THE FILE
        </p>
        <div ref={hostRef} className="folder-stage__canvas" aria-label="3D 文件夹，点击打开" />
        <footer className="folder-stage__foot">
          <span>{STATE_LABEL[state]}</span>
          <span>{state === 'focus' ? FOLDER_ITEMS[focus].name : `${FOLDER_ITEMS.length} ITEMS INSIDE`}</span>
        </footer>
      </section>

      <div className="folder-controls" role="toolbar" aria-label="文件夹控制">
        <button type="button" className={auto ? 'is-on' : ''} onClick={() => setAuto((v) => !v)}>
          {auto ? '暂停演示' : '自动演示'}
        </button>
        <button type="button" onClick={() => manual((s) => s.setState(state === 'closed' ? 'open' : 'closed'))}>
          {state === 'closed' ? '打开' : '合上'}
        </button>
        <button type="button" onClick={() => manual((s) => s.setState(state === 'fan' ? 'open' : 'fan'))}>
          {state === 'fan' ? '收回物件' : '全部飞出'}
        </button>
        <button type="button" onClick={() => manual((s) => s.next())}>
          下一个
        </button>
        <button type="button" onClick={() => manual((s) => s.shake())}>
          抖一抖
        </button>
      </div>
      <p className="folder-hint">点击文件夹打开 / 合上；打开后点任一物件让它们全部飞出，再点某个放大查看，点空白处返回。</p>

      <section className="folder-ref">
        <div className="folder-ref__text">
          <h2>参考视频</h2>
          <p>通过 Pinterest 官方嵌入组件播放，版权归原作者所有。本页按视频里的物件品类（回形针、像素窗口、铅笔、笑脸徽章、钥匙扣、四叶草、对话气泡）用 Three.js 重新建模，文字换成 ITZY 主题。</p>
          <a href={PIN_URL} target="_blank" rel="noreferrer">
            在 Pinterest 查看原 Pin ↗
          </a>
        </div>
        <div className="folder-ref__embed">
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
