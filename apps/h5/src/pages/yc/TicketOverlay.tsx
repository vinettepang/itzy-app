import { useMemo } from 'react';
import { splitName } from './splitName';

export type TicketCopy = {
  /** Large center lines (1–2). Falls back to splitting `name`. */
  headline?: string;
  kickerTop?: string;
  kickerBottom?: string;
  footer?: string;
  /** Default YC stub: rotated ADMIT ONE + year watermark */
  admit?: string;
  year?: string;
  /** Concert stub: same stack as flat ticket — month / day / year / badge */
  stubLayout?: 'admit' | 'date';
  month?: string;
  day?: string;
  daysLeft?: number | null;
  titleAttr?: string;
  descAttr?: string;
};

type Props = {
  name: string;
  copy?: TicketCopy;
  /** Extra px added to body text (+2) and countdown badge (+4) on newnew tickets. */
  fontBoost?: { body?: number; countdown?: number };
  /** Wide short bar — stretch overlay and push copy toward left/right edges. */
  layout?: 'default' | 'compact';
};

type LayoutMetrics = {
  leftX: number;
  kickerY: [number, number];
  nameY: (i: number, lineCount: number) => number;
  footerY: number;
  sepX: number;
  dateMonth: { x: number; y: number };
  dateDay: { x: number; y: number };
  dateYear: { x: number; y: number };
  badge: { rectX: number; rectY: number; textX: number; textY: number };
};

const LAYOUTS: Record<'default' | 'compact', LayoutMetrics> = {
  default: {
    leftX: 36,
    kickerY: [43, 60],
    nameY: (i, lineCount) => (lineCount === 1 ? 158 : 137 + 43 * i),
    footerY: 244,
    sepX: 395.2,
    dateMonth: { x: 450, y: 78 },
    dateDay: { x: 450, y: 138 },
    dateYear: { x: 498, y: 140 },
    badge: { rectX: 418, rectY: 198, textX: 450, textY: 213 },
  },
  compact: {
    leftX: 30,
    kickerY: [50, 66],
    nameY: (i, lineCount) => (lineCount === 1 ? 156 : 136 + 40 * i),
    footerY: 234,
    sepX: 398,
    dateMonth: { x: 462, y: 82 },
    dateDay: { x: 462, y: 132 },
    dateYear: { x: 500, y: 134 },
    badge: { rectX: 430, rectY: 186, textX: 462, textY: 201 },
  },
};

function splitHeadline(text: string): string[] {
  if (text.includes(' · ')) {
    return text
      .split(' · ')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 2);
  }
  if (text.includes('·')) {
    return text
      .split('·')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 2);
  }
  return splitName(text).slice(0, 2);
}

const YC_DEFAULTS: Required<
  Pick<
    TicketCopy,
    | 'kickerTop'
    | 'kickerBottom'
    | 'footer'
    | 'admit'
    | 'year'
    | 'titleAttr'
    | 'descAttr'
  >
> = {
  kickerTop: 'Y COMBINATOR PRESENTS',
  kickerBottom: 'STARTUP SCHOOL 2026',
  footer: 'CHASE CENTER, SF · JULY 25–26',
  admit: 'ADMIT ONE',
  year: '2026',
  titleAttr: 'Startup School 2026 admission ticket',
  descAttr:
    'An animated orange event ticket for July 25–26 at Chase Center in San Francisco.',
};

/** SVG ticket typography overlay (SOURCE · fn-svg-u). */
export default function TicketOverlay({
  name,
  copy,
  fontBoost,
  layout = 'default',
}: Props) {
  const bodyBoost = fontBoost?.body ?? 0;
  const countdownBoost = fontBoost?.countdown ?? 0;
  const metrics = LAYOUTS[layout];
  const compact = layout === 'compact';
  const kickerTop = copy?.kickerTop ?? YC_DEFAULTS.kickerTop;
  const kickerBottom = copy?.kickerBottom ?? YC_DEFAULTS.kickerBottom;
  const footer = copy?.footer ?? YC_DEFAULTS.footer;
  const admit = copy?.admit ?? YC_DEFAULTS.admit;
  const year = copy?.year ?? YC_DEFAULTS.year;
  const stubLayout = copy?.stubLayout ?? 'admit';
  const month = copy?.month ?? '';
  const day = String(copy?.day ?? '').replace(/\D/g, '') || copy?.day || '';
  const daysLeft = copy?.daysLeft ?? null;
  const titleAttr =
    copy?.titleAttr ?? `${YC_DEFAULTS.titleAttr} for ${name}`;
  const descAttr = copy?.descAttr ?? YC_DEFAULTS.descAttr;

  const lines = useMemo(() => {
    const source = copy?.headline ?? name;
    return splitHeadline(source);
  }, [copy?.headline, name]);
  const longest = Math.max(...lines.map((l) => l.length), 1);
  const nameSize =
    Math.max(16, Math.min(36, 320 / Math.max(longest, 7))) + bodyBoost;
  const smallSize = 11 + bodyBoost;
  const monthSize = 12 + bodyBoost;
  const daySize = 42 + bodyBoost;
  const yearSize = 11 + bodyBoost;
  const badgeSize = 11 + countdownBoost;
  return (
    <svg
      id="ticket-overlay"
      className={`ticket-overlay${compact ? ' ticket-overlay--compact' : ''}`}
      viewBox="0 0 520 280"
      preserveAspectRatio={compact ? 'none' : 'xMidYMid meet'}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{titleAttr}</title>
      <desc>{descAttr}</desc>
      <g className="ticket-copy ticket-small" style={{ fontSize: smallSize }}>
        <text x={metrics.leftX} y={metrics.kickerY[0]}>
          {kickerTop}
        </text>
        <text x={metrics.leftX} y={metrics.kickerY[1]}>
          {kickerBottom}
        </text>
      </g>
      <g
        className="ticket-copy ticket-name"
        aria-label={copy?.headline ?? name}
        style={{ fontSize: nameSize }}
      >
        {lines.map((line, i) => (
          <text
            key={`${line}-${i}`}
            x={metrics.leftX}
            y={metrics.nameY(i, lines.length)}
          >
            {line}
          </text>
        ))}
      </g>
      <text
        x={metrics.leftX}
        y={metrics.footerY}
        className="ticket-copy ticket-small"
        style={{ fontSize: smallSize }}
      >
        {footer}
      </text>
      <line
        x1={metrics.sepX}
        y1="18"
        x2={metrics.sepX}
        y2="262"
        className="ticket-separator"
      />
      {stubLayout === 'date' ? (
        <g className="ticket-date-stub" aria-label={`${month}月 ${day} ${year}`}>
          <text
            x={metrics.dateMonth.x}
            y={metrics.dateMonth.y}
            textAnchor="middle"
            className="ticket-copy ticket-date-month"
            style={{ fontSize: monthSize }}
          >
            {month}月
          </text>
          <text
            x={metrics.dateDay.x}
            y={metrics.dateDay.y}
            textAnchor="middle"
            className="ticket-copy ticket-date-day"
            style={{ fontSize: daySize }}
          >
            {day}
          </text>
          <text
            x={metrics.dateYear.x}
            y={metrics.dateYear.y}
            textAnchor="middle"
            className="ticket-copy ticket-date-year"
            transform={`rotate(90 ${metrics.dateYear.x} ${metrics.dateYear.y})`}
            style={{ fontSize: yearSize }}
          >
            {year}
          </text>
          {daysLeft !== null && daysLeft !== undefined ? (
            <g className="ticket-date-badge">
              <rect
                x={metrics.badge.rectX}
                y={metrics.badge.rectY}
                width="64"
                height={22 + Math.max(0, countdownBoost - 2)}
                rx="11"
                ry="11"
                className="ticket-date-badge-bg"
              />
              <text
                x={metrics.badge.textX}
                y={metrics.badge.textY + Math.max(0, countdownBoost - 2)}
                textAnchor="middle"
                className="ticket-copy ticket-date-badge-text"
                style={{ fontSize: badgeSize }}
              >
                {daysLeft}天
              </text>
            </g>
          ) : null}
        </g>
      ) : (
        <>
          <text
            x="451"
            y="27"
            className="ticket-copy ticket-admit"
            transform="rotate(90 451 27)"
          >
            {admit}
          </text>
          <text
            x="474"
            y="13"
            className="ticket-year"
            transform="rotate(90 474 13)"
          >
            {year}
          </text>
        </>
      )}
    </svg>
  );
}
