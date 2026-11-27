import type { TransitionEvent } from 'react';
import { Link } from 'react-router-dom';

const PILLS = [
  { to: '/pv/dolls', kicker: 'Dolls', title: '娃娃\n图鉴', tone: 'green' },
  { to: '/pv/variety', kicker: 'Variety', title: '综艺\n合集', tone: 'orange' },
  { to: '/pv/albums', kicker: 'Albums', title: '专辑', tone: 'pink' },
] as const;

function Glass() {
  return (
    <>
      <i className="navy-bloom" aria-hidden />
      <i className="navy-fill" aria-hidden />
      <i className="navy-frost" aria-hidden />
      <i className="navy-sheen" aria-hidden />
    </>
  );
}

type PanterVisionNavProps = {
  open: boolean;
  onShellTransitionEnd?: () => void;
};

/** Nav 页同款玻璃卡片导航，叠在 Panter Vision 场景之上 */
export default function PanterVisionNav({ open, onShellTransitionEnd }: PanterVisionNavProps) {
  const rootClass = ['navy', 'panter-vision-page__nav', open && 'panter-vision-page__nav--open']
    .filter(Boolean)
    .join(' ');

  const onTransitionEnd = (e: TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget || e.propertyName !== 'opacity') return;
    onShellTransitionEnd?.();
  };

  return (
    <div
      id="panter-vision-nav"
      className={rootClass}
      aria-label="Site navigation"
      aria-hidden={!open}
      onTransitionEnd={onTransitionEnd}
      {...(!open ? { inert: '' } : {})}
    >
      <Link to="/menu" className="navy__back default-link">
        ← Menu
      </Link>

      <div className="navy__grid">
        <Link to="/pv/cheer/tunnel-vision" className="navy-card navy-hero default-link">
          <Glass />
          <span className="navy-kicker">MIDZY · Cheer</span>
          <div className="navy-hero__body">
            <h1>应援法</h1>
            <p>三巡 Tunnel Vision 应援口号与节奏，现场齐声用。</p>
          </div>
        </Link>

        <Link to="/pv/schedules" className="navy-card navy-facts default-link">
          <Glass />
          <span className="navy-kicker">Tour</span>
          <h2>行程</h2>
        </Link>

        <div className="navy-pills">
          {PILLS.map((p) => (
            <Link key={p.tone} to={p.to} className={`navy-card navy-pill navy-pill--${p.tone} default-link`}>
              <Glass />
              <span className="navy-kicker">{p.kicker}</span>
              <h3>
                {p.title.split('\n').map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </h3>
            </Link>
          ))}
        </div>

        <Link to="/pv/jar" className="navy-card navy-readme default-link">
          <Glass />
          <span className="navy-kicker">Memory</span>
          <h2>金色记忆球</h2>
        </Link>

        <Link to="/menu" className="navy-card navy-download default-link">
          <Glass />
          <span className="navy-kicker">ITZY App</span>
          <h2>全部入口</h2>
        </Link>
      </div>
    </div>
  );
}