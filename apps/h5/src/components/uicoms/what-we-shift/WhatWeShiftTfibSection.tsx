import { useEffect, useRef } from 'react';
import { initSsWwsScroll } from './initSsWwsScroll';
import './ss-wws-fonts.css';
import './ss-wws.css';

const TFIB_WWS_GIF =
  '/thefutureinblack/assets/static/69f3f6e86bfa6f4418b84f0e/t/6a04ca1b67b84a026dea34c4/1778698783176/IMG_7315.gif';

export type WhatWeShiftTfibSectionProps = {
  className?: string;
};

/**
 * The Future in Black「WHAT WE SHIFT」区块 — HTML/CSS/JS 与 site-inner 一致。
 */
export default function WhatWeShiftTfibSection({ className }: WhatWeShiftTfibSectionProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    return initSsWwsScroll(root);
  }, []);

  const rootClass = ['uicoms-ss-wws-root', className].filter(Boolean).join(' ');

  return (
    <div ref={rootRef} className={rootClass}>
      <div className="ss-wws-section">
        <div className="ss-wws-sticky">
          <img className="ss-wws-gif" src={TFIB_WWS_GIF} alt="" aria-hidden="true" />

          <div className="ss-wws-notes" id="ss-wws-notes">
            <div className="ss-wws-note" style={{ top: '30%', left: '9%', ['--r' as string]: '-3deg' }}>
              <p>Play from &quot;nice to have&quot; to essential.</p>
            </div>
            <div className="ss-wws-note" style={{ top: '60%', left: '27%', ['--r' as string]: '2deg' }}>
              <p>For brands, from reflecting culture to shaping it.</p>
            </div>
            <div className="ss-wws-note" style={{ top: '34%', left: '45%', ['--r' as string]: '-2deg' }}>
              <p>For institutions, from singular narratives to expansive new visual languages.</p>
            </div>
            <div className="ss-wws-note" style={{ top: '58%', left: '68%', ['--r' as string]: '3deg' }}>
              <p>Imagination isn&apos;t reacting to the future. It&apos;s building it.</p>
            </div>
            <div className="ss-wws-note" style={{ top: '24%', left: '80%', ['--r' as string]: '-3deg' }}>
              <p>For creatives, from self-doubt to creative sovereignty.</p>
            </div>
          </div>

          <div className="ss-wws-mask-wrap" id="ss-wws-mask-wrap">
            <svg
              viewBox="0 0 1000 560"
              preserveAspectRatio="xMidYMid slice"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <defs>
                <mask id="ss-wws-text-mask" maskUnits="userSpaceOnUse" x="-1000" y="-720" width="3000" height="2000">
                  <rect x="-1000" y="-720" width="3000" height="2000" fill="white" />
                  <text
                    id="ss-wws-text"
                    x="500"
                    y="280"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="black"
                    fontFamily="'Million', var(--heading-font-font-family, 'Arial Black', sans-serif)"
                    fontWeight={800}
                    letterSpacing={0}
                    style={{ textTransform: 'uppercase' }}
                    fontSize={130}
                  >
                    WHAT WE SHIFT
                  </text>
                </mask>
              </defs>
              <rect x="-1000" y="-720" width="3000" height="2000" fill="#ffffff" mask="url(#ss-wws-text-mask)" />
            </svg>
          </div>

          <div className="ss-wws-hint" id="ss-wws-hint">
            <span>Scroll</span>
            <div className="ss-wws-hint-line" />
          </div>
        </div>
      </div>
    </div>
  );
}
