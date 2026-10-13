import { useEffect, useId, useRef } from 'react';
import './ScrollTextZoomSection.css';

export type ScrollTextZoomNote = {
  top: string;
  left: string;
  rotation?: string;
  text: string;
};

export type ScrollTextZoomSectionProps = {
  /** 镂空放大主文案 */
  text: string;
  /** 背景图（镂空下方可见内容） */
  backgroundSrc?: string;
  backgroundAlt?: string;
  notes?: ScrollTextZoomNote[];
  /** 滚动跑道高度（vh），原站 650 */
  sectionHeightVh?: number;
  /**
   * 进度 0→1 对应的滚动距离（vh）。未设置时用整段 section 高度。
   * 嵌入页面时可设小一些，让放大在可视区内完成。
   */
  scrollRunwayVh?: number;
  /**
   * pinned：先 sticky 全屏贴顶固定展示，再继续滚动才驱动动画（原站逻辑）
   * inView：section 进入视口即开始计进度
   */
  scrollProgressMode?: 'pinned' | 'inView';
  /** pinned 模式下，到达锚点后额外停留的滚动距离（vh），再开始放大 */
  pinHoldVh?: number;
  /** pinned 锚点：top 贴顶 / center 视口垂直居中后固定再放大 */
  pinAnchor?: 'top' | 'center';
  /** center 锚点时，sticky 前的引导高度（vh），便于滚入居中 */
  centerLeadVh?: number;
  /** 最大缩放倍数，原站 13 */
  maxScale?: number;
  headingFontFamily?: string;
  showScrollHint?: boolean;
  className?: string;
};

const DEFAULT_NOTES: ScrollTextZoomNote[] = [
  { top: '30%', left: '9%', rotation: '-3deg', text: 'Play from "nice to have" to essential.' },
  { top: '60%', left: '27%', rotation: '2deg', text: 'For brands, from reflecting culture to shaping it.' },
  {
    top: '34%',
    left: '45%',
    rotation: '-2deg',
    text: 'For institutions, from singular narratives to expansive new visual languages.',
  },
  {
    top: '58%',
    left: '68%',
    rotation: '3deg',
    text: "Imagination isn't reacting to the future. It's building it.",
  },
  { top: '24%', left: '80%', rotation: '-3deg', text: 'For creatives, from self-doubt to creative sovereignty.' },
];

const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), b);
const inv = (a: number, b: number, v: number) => clamp((v - a) / (b - a), 0, 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeIn = (t: number, p: number) => Math.pow(t, p);
const easeOut = (t: number, p: number) => 1 - Math.pow(1 - t, p);

const NOTES_START = 0.58;
const NOTES_END = 0.92;

function isVerticallyCentered(sticky: HTMLElement, vh: number, tolerancePx = 5): boolean {
  const r = sticky.getBoundingClientRect();
  const centerY = r.top + r.height / 2;
  return Math.abs(centerY - vh / 2) <= tolerancePx;
}

function runwayPx(vh: number, scrollRunwayVh?: number, fallbackPx?: number): number {
  if (scrollRunwayVh != null) return Math.max((scrollRunwayVh / 100) * vh, 1);
  return Math.max(fallbackPx ?? vh, 1);
}

function computeScrollProgress(
  section: HTMLElement,
  sticky: HTMLElement,
  mode: 'pinned' | 'inView',
  scrollRunwayVh?: number,
  pinHoldVh?: number,
  pinAnchor: 'top' | 'center' = 'center',
  engageScrollY: number | null = null,
): { p: number; engageScrollY: number | null } {
  const rect = section.getBoundingClientRect();
  const vh = window.innerHeight;
  const pinRunway = section.offsetHeight - vh;
  if (pinRunway <= 0) return { p: 0, engageScrollY };

  const holdPx = ((pinHoldVh ?? 0) / 100) * vh;
  const scrollY = window.scrollY;

  if (mode === 'inView') {
    const traveled = vh - rect.top;
    const total = runwayPx(vh, scrollRunwayVh, section.offsetHeight);
    return { p: clamp(traveled / total, 0, 1), engageScrollY };
  }

  if (pinAnchor === 'center') {
    const centered = isVerticallyCentered(sticky, vh);
    let nextEngage = engageScrollY;

    if (centered && nextEngage === null) {
      nextEngage = scrollY;
    }
    if (!centered && nextEngage !== null && scrollY < nextEngage - 24) {
      nextEngage = null;
    }
    if (nextEngage === null) {
      return { p: 0, engageScrollY: nextEngage };
    }

    const traveled = Math.max(0, scrollY - nextEngage - holdPx);
    const total = runwayPx(vh, scrollRunwayVh, pinRunway);
    return { p: clamp(traveled / total, 0, 1), engageScrollY: nextEngage };
  }

  if (rect.top > 0) return { p: 0, engageScrollY: null };

  const traveled = Math.max(0, -rect.top - holdPx);
  const total = runwayPx(vh, scrollRunwayVh, Math.max(pinRunway - holdPx, 1));
  return { p: clamp(traveled / total, 0, 1), engageScrollY: null };
}

/**
 * 滚动驱动 SVG 文字镂空放大（The Future in Black — WHAT WE SHIFT 段落）。
 */
export default function ScrollTextZoomSection({
  text,
  backgroundSrc,
  backgroundAlt = '',
  notes = DEFAULT_NOTES,
  sectionHeightVh = 650,
  scrollRunwayVh,
  scrollProgressMode = 'pinned',
  pinHoldVh = 0,
  pinAnchor = 'center',
  centerLeadVh = 40,
  maxScale = 13,
  headingFontFamily = "'Arial Black', sans-serif",
  showScrollHint = true,
  className,
}: ScrollTextZoomSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const maskWrapRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const noteRefs = useRef<(HTMLDivElement | null)[]>([]);

  const rawId = useId();
  const maskId = `uicom-stz-mask-${rawId.replace(/:/g, '')}`;

  useEffect(() => {
    const section = sectionRef.current;
    const sticky = stickyRef.current;
    const maskWrap = maskWrapRef.current;
    const hint = hintRef.current;
    const textEl = textRef.current;
    const noteEls = noteRefs.current.filter(Boolean) as HTMLDivElement[];

    if (!section || !sticky || !maskWrap) return;

    let engageScrollY: number | null = null;

    const fitText = () => {
      if (!textEl) return;
      try {
        textEl.setAttribute('font-size', '130');
        const b = textEl.getBBox();
        if (!b?.width) return;
        const scale = Math.min(880 / b.width, 320 / b.height);
        textEl.setAttribute('font-size', String(130 * scale));
      } catch {
        /* SVG not laid out yet */
      }
    };

    fitText();
    const t1 = window.setTimeout(fitText, 250);
    const t2 = window.setTimeout(fitText, 800);
    window.addEventListener('resize', fitText);

    let ticking = false;

    const update = () => {
      ticking = false;

      const progress = computeScrollProgress(
        section,
        sticky,
        scrollProgressMode,
        scrollRunwayVh,
        pinHoldVh,
        pinAnchor,
        engageScrollY,
      );
      engageScrollY = progress.engageScrollY;
      const p = progress.p;

      const scale = lerp(1, maxScale, easeIn(inv(0, 0.5, p), 2.5));
      maskWrap.style.transform = `scale(${scale})`;
      maskWrap.style.opacity = String(1 - easeOut(inv(0.38, 0.55, p), 2));

      const span = NOTES_END - NOTES_START;
      const per = span / Math.max(noteEls.length, 1);
      noteEls.forEach((note, i) => {
        const start = NOTES_START + i * per;
        const t = easeOut(inv(start, start + per * 1.4, p), 2);
        const rot = note.style.getPropertyValue('--r') || '0deg';
        note.style.opacity = String(t);
        note.style.transform = `translateX(${lerp(80, 0, t)}px) rotate(${rot})`;
      });

      if (hint) {
        hint.style.opacity = String(1 - clamp(p / 0.06, 0, 1));
      }
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    update();

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener('resize', fitText);
      window.removeEventListener('scroll', onScroll);
    };
  }, [maxScale, notes.length, pinAnchor, pinHoldVh, scrollProgressMode, scrollRunwayVh, text]);

  const rootClass = [
    'uicom-scroll-text-zoom',
    pinAnchor === 'center' ? 'uicom-scroll-text-zoom--pin-center' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const centerLeadPx = pinAnchor === 'center' ? `${centerLeadVh}vh` : '0px';

  return (
    <section
      ref={sectionRef}
      className={rootClass}
      style={{
        height: `${sectionHeightVh}vh`,
        ['--uicom-stz-center-lead' as string]: centerLeadPx,
      }}
    >
      {pinAnchor === 'center' && <div className="uicom-scroll-text-zoom__lead" aria-hidden />}
      <div ref={stickyRef} className="uicom-scroll-text-zoom__sticky">
        {backgroundSrc ? (
          <img className="uicom-scroll-text-zoom__bg" src={backgroundSrc} alt={backgroundAlt} aria-hidden={!backgroundAlt} />
        ) : (
          <div className="uicom-scroll-text-zoom__bg uicom-scroll-text-zoom__bg--placeholder" aria-hidden />
        )}

        <div className="uicom-scroll-text-zoom__notes">
          {notes.map((note, i) => (
            <div
              key={i}
              ref={(el) => {
                noteRefs.current[i] = el;
              }}
              className="uicom-scroll-text-zoom__note"
              style={{
                top: note.top,
                left: note.left,
                ['--r' as string]: note.rotation ?? '0deg',
              }}
            >
              <p>{note.text}</p>
            </div>
          ))}
        </div>

        <div ref={maskWrapRef} className="uicom-scroll-text-zoom__mask-wrap">
          <svg viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <defs>
              <mask id={maskId} maskUnits="userSpaceOnUse" x="-1000" y="-720" width="3000" height="2000">
                <rect x="-1000" y="-720" width="3000" height="2000" fill="white" />
                <text
                  ref={textRef}
                  x="500"
                  y="280"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="black"
                  fontFamily={headingFontFamily}
                  fontWeight={800}
                  letterSpacing={0}
                  style={{ textTransform: 'uppercase' }}
                  fontSize={130}
                >
                  {text}
                </text>
              </mask>
            </defs>
            <rect x="-1000" y="-720" width="3000" height="2000" fill="#ffffff" mask={`url(#${maskId})`} />
          </svg>
        </div>

        {showScrollHint && (
          <div ref={hintRef} className="uicom-scroll-text-zoom__hint">
            <span>Scroll</span>
            <div className="uicom-scroll-text-zoom__hint-line" />
          </div>
        )}
      </div>
    </section>
  );
}
