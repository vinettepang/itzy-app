import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CrystalHero, WhatWeShiftTfibSection } from '@/components/uicoms';
import './uicoms.css';

export default function UicomsPage() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyHeight = body.style.height;
    const prevBodyWidth = body.style.width;

    html.style.overflow = 'visible';
    body.style.overflowX = 'hidden';
    body.style.overflowY = 'auto';
    body.style.height = 'auto';
    body.style.width = 'auto';

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.height = prevBodyHeight;
      body.style.width = prevBodyWidth;
    };
  }, []);

  return (
    <div className="uicoms-page">
      <header className="uicoms-header">
        <h1>UIComs</h1>
        <Link to="/menu">Menu</Link>
      </header>

      <div className="uicoms-intro">
        <h2>特效组件库</h2>
        <p>
          从站点效果抽离的可复用 React 组件。下方为 The Future in Black「WHAT WE SHIFT」滚动镂空文字放大段落。
        </p>
      </div>

      <div className="uicoms-catalog">
        <article className="uicoms-card">
          <h3>CrystalHero</h3>
          <code>@/components/uicoms/CrystalHero</code>
          <p>玻璃板条随机翻滚后拼成 ITZY，停留后散开循环；亮边 + 波纹暗芯 + Bloom 辉光。</p>
        </article>
        <article className="uicoms-card">
          <h3>WhatWeShiftTfibSection</h3>
          <code>@/components/uicoms/what-we-shift</code>
          <p>与 thefutureinblack 一致的 WHAT WE SHIFT（650vh / scale 1→13 / 原站脚本）。</p>
        </article>
      </div>

      <CrystalHero
        title="Crystal Hero"
        subtitle="Glass slabs · rim glow + ripple refraction"
        dprCap={1.75}
      />

      <div className="uicoms-demo uicoms-demo--wws">
        <WhatWeShiftTfibSection />
      </div>
    </div>
  );
}
