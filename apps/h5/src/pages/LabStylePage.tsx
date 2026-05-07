import { Link } from 'react-router-dom';
import './LabStylePage.css';

export default function LabStylePage() {
  return (
    <div className="y2k-page">
      <div className="y2k-topline">
        <div className="y2k-pill">
          <span className="y2k-pill-dot" />
          <span className="y2k-pill-text">concept · y2k acid type</span>
        </div>
        <div className="y2k-pill y2k-pill--ghost">
          <span className="y2k-pill-text">unseen-ish</span>
        </div>
      </div>

      <div className="y2k-hero">
        <div className="y2k-title">
          CREATING <span className="y2k-title-acid">the UNEXPECTED</span>
        </div>
        <div className="y2k-sub">H5 版 LAB：酸性标题 + 果冻玻璃 + 气泡按钮（与小程序 LAB-style 对应）。</div>
        <div className="y2k-microcopy">
          <span className="y2k-microcopy-kbd">CLICK + HOLD</span>
          <span className="y2k-microcopy-text">把这套 class 复用到任意页面即可</span>
        </div>
      </div>

      <div className="y2k-orb" aria-hidden="true">
        <div className="y2k-orb-inner" />
        <div className="y2k-orb-glare" />
      </div>

      <div className="y2k-grid">
        <div className="y2k-card">
          <div className="y2k-card-title">Cards</div>
          <div className="y2k-card-desc">玻璃果冻底 + 冷色细边框 + 软阴影，适合承载信息块。</div>
          <div className="y2k-divider" />
          <div className="y2k-actions">
            <button className="y2k-btn y2k-btn--primary" type="button">
              <span className="y2k-btn-text">Primary</span>
            </button>
            <button className="y2k-btn" type="button">
              <span className="y2k-btn-text">Default</span>
            </button>
            <button className="y2k-btn y2k-btn--ghost" type="button">
              <span className="y2k-btn-text">Ghost</span>
            </button>
          </div>
          <div className="y2k-field">
            <div className="y2k-label">Input</div>
            <input className="y2k-input" placeholder="Type something…" />
          </div>
        </div>

        <div className="y2k-footer-card">
          <div className="y2k-footer-title">快捷跳转</div>
          <div className="y2k-footer-desc">去试试海报生成与预览下载。</div>
          <div style={{ height: 10 }} />
          <div className="y2k-actions">
            <Link className="y2k-linkpill" to="/poster">
              Poster →
            </Link>
            <Link className="y2k-linkpill" to="/schedules">
              Schedules →
            </Link>
            <Link className="y2k-linkpill" to="/gallery/local-demo-album">
              Album →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

