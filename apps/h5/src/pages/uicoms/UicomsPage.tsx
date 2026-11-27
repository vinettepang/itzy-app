import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BalloonText,
  CrystalHero,
  GlassDonutHero,
  PanterVisionHero,
  WhatWeShiftTfibSection,
} from '@/components/uicoms';
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
          <p>厚玻璃板：磨砂霜纹、亮棱、交叠爆白；随机翻滚后拼成 ITZY。</p>
        </article>
        <article className="uicoms-card">
          <h3>BalloonText</h3>
          <code>@/components/uicoms/BalloonText</code>
          <p>蓝色箔膜充气字：每个字母边缘褶皱各不相同，弹簧式左右晃动回弹，鼠标划过可拨动。</p>
        </article>
        <article className="uicoms-card">
          <h3>GlassDonutHero</h3>
          <code>@/components/uicoms/GlassDonutHero</code>
          <p>
            旋转玻璃甜甜圈：透射 + 彩虹环境折射、色散后处理与环绕彩光，鼠标/触摸可轻微倾斜视角（类 C4D prism donut 教程）。
          </p>
        </article>
        <article className="uicoms-card">
          <h3>PanterVisionHero</h3>
          <code>@/components/uicoms/PanterVisionHero</code>
          <p>
            Panter Vision 风黑白海报：顶栏元数据、超大标题、描边副标、斜纹与笑脸；中央 3D 玻璃字 ITZY 逐字错相摆动，折射扭曲背景并带棱镜色散。
          </p>
          <Link to="/panter-vision" className="uicoms-card-link">
            全屏预览 →
          </Link>
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

      <GlassDonutHero
        title="Prism Donut"
        subtitle="Spinning glass torus · transmission & chromatic dispersion"
        dprCap={1.75}
      />

      <PanterVisionHero dprCap={1.75} />

      <BalloonText text="allinus" dprCap={1.75} />

      <div className="uicoms-demo uicoms-demo--wws">
        <WhatWeShiftTfibSection />
      </div>
    </div>
  );
}
