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
export default function TicketOverlay({ name, copy }: Props) {
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
  const nameSize = Math.max(16, Math.min(36, 320 / Math.max(longest, 7)));

  return (
    <svg
      id="ticket-overlay"
      className="ticket-overlay"
      viewBox="0 0 520 280"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{titleAttr}</title>
      <desc>{descAttr}</desc>
      <g className="ticket-copy ticket-small">
        <text x="36" y="43">
          {kickerTop}
        </text>
        <text x="36" y="60">
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
            x="36"
            y={lines.length === 1 ? 158 : 137 + 43 * i}
          >
            {line}
          </text>
        ))}
      </g>
      <text x="36" y="244" className="ticket-copy ticket-small">
        {footer}
      </text>
      <line
        x1="395.2"
        y1="18"
        x2="395.2"
        y2="262"
        className="ticket-separator"
      />
      {stubLayout === 'date' ? (
        <g className="ticket-date-stub" aria-label={`${month}月 ${day} ${year}`}>
          <text
            x="450"
            y="78"
            textAnchor="middle"
            className="ticket-copy ticket-date-month"
          >
            {month}月
          </text>
          <text
            x="450"
            y="138"
            textAnchor="middle"
            className="ticket-copy ticket-date-day"
          >
            {day}
          </text>
          <text
            x="498"
            y="140"
            textAnchor="middle"
            className="ticket-copy ticket-date-year"
            transform="rotate(90 498 140)"
          >
            {year}
          </text>
          {daysLeft !== null && daysLeft !== undefined ? (
            <g className="ticket-date-badge">
              <rect
                x="418"
                y="198"
                width="64"
                height="22"
                rx="11"
                ry="11"
                className="ticket-date-badge-bg"
              />
              <text
                x="450"
                y="213"
                textAnchor="middle"
                className="ticket-copy ticket-date-badge-text"
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
