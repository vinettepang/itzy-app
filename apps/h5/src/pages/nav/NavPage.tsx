import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './nav.css';

const PILLS = [
  { to: '/people', kicker: 'Racial Justice', title: 'Decode\nthe Default', tone: 'green' },
  { to: '/songs', kicker: 'Labor Rights', title: 'Unlock\nData Power', tone: 'orange' },
  { to: '/jar', kicker: 'Transparency', title: 'Real\nChange\nHow?', tone: 'pink' },
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
      <path
        d="M19 11.5A7.5 7.5 0 1 1 12.2 4M17 17l4 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M17.5 2.5 18.3 5l2.4.8-2.4.8-.8 2.4-.8-2.4-2.4-.8 2.4-.8z" fill="currentColor" />
    </svg>
  );
}

export default function NavPage() {
  const [full, setFull] = useState(false);
  useEffect(() => {
    const body = document.body;
    const prev = { overflow: body.style.overflow, bg: body.style.background, height: body.style.height };
    body.style.overflow = 'auto';
    body.style.height = 'auto';
    body.style.background = '#e4e4e4';
    return () => {
      body.style.overflow = prev.overflow;
      body.style.height = prev.height;
      body.style.background = prev.bg;
    };
  }, []);

  useEffect(() => {
    const onFs = () => setFull(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  const toggleFull = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.();
  }, []);

  return (
    <div className="navy">
      <Link to="/menu" className="navy__back default-link">
        ← Menu
      </Link>

      <div className="navy__grid">
        <Link to="/" className="navy-card navy-hero default-link">
          <Glass />
          <span className="navy-kicker">End of Year Analysis</span>
          <div className="navy-hero__body">
            <h1>
              A Healthier
              <br />
              Internet is
              <br />
              Possible
            </h1>
            <p>In a challenging year for the world, the internet helped us and harmed us like never before.</p>
          </div>
        </Link>

        <Link to="/albums" className="navy-card navy-facts default-link">
          <Glass />
          <span className="navy-kicker">Internet Health Vitals</span>
          <h2>
            Facts and Figures
          </h2>
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

        <Link to="/menu" className="navy-card navy-readme default-link">
          <Glass />
          <span className="navy-kicker">About</span>
          <h2>Readme</h2>
        </Link>

        <Link to="/albums" className="navy-card navy-download default-link">
          <Glass />
          <span className="navy-kicker">PDF &amp; EPUB</span>
          <h2>Download</h2>
        </Link>

        <div className="navy-tools">
          <button type="button" className="navy-card navy-icon" onClick={toggleFull} aria-label={full ? '退出全屏' : '全屏'}>
            <Glass />
            <ExpandIcon />
          </button>
          <Link to="/menu" className="navy-card navy-icon default-link" aria-label="搜索页面">
            <Glass />
            <SearchSparkIcon />
          </Link>
        </div>
      </div>
    </div>
  );
}
