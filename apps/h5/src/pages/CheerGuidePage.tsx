import { Link, useParams } from 'react-router-dom';
import { CHEER_GUIDES } from '@/pages/cheer/cheerData';
import { useScrollDamping } from '@/hooks/useScrollDamping';
import './CheerGuidePage.css';

export default function CheerGuidePage() {
  useScrollDamping();
  const { slug = '' } = useParams<{ slug: string }>();
  const guide = CHEER_GUIDES[slug];

  if (!guide) {
    return (
      <div className="cheer-page cheer-page--empty">
        <p className="cheer-empty">暂无该曲应援法</p>
        <Link className="cheer-back" to="/setlist">
          ← 返回歌单
        </Link>
      </div>
    );
  }

  const accent = guide.accent ?? 'cyan';
  const hasEcho = guide.columns.some((col) =>
    col.some((line) => line.spans.some((s) => s.tone === 'echo')),
  );

  return (
    <div className={`cheer-page cheer-page--${accent}`}>
      <header className="cheer-header">
        <h1 className="cheer-title">{guide.title}</h1>
      </header>

      <div className="cheer-columns">
        {guide.columns.map((column, colIdx) => (
          <div key={colIdx} className="cheer-column">
            {column.map((line, lineIdx) => (
              <p key={lineIdx} className="cheer-line">
                {line.spans.map((span, spanIdx) => (
                  <span
                    key={spanIdx}
                    className={`cheer-span cheer-span--${span.tone}`}
                  >
                    {span.text}
                  </span>
                ))}
              </p>
            ))}
          </div>
        ))}
      </div>

      {/*
        挂在歌词页内（非 body portal）：
        - 父级无 transform 时 fixed 贴视口
        - 返回过渡父级带 transform 时随页一起滑走并卸载
      */}
      <div className="cheer-floatDock" aria-label="颜色说明">
        <div className="cheer-legend cheer-legend--float">
          <span className="cheer-legend__item cheer-legend__item--lyric">歌词</span>
          <span className="cheer-legend__item cheer-legend__item--cheer">应援</span>
          {hasEcho ? (
            <span className="cheer-legend__item cheer-legend__item--echo">跟喊</span>
          ) : null}
        </div>
      </div>
      <Link className="cheer-back cheer-back--float" to="/setlist">
        ← 歌单
      </Link>
    </div>
  );
}
