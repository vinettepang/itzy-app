import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { TicketArtwork } from '@/pages/yc/TicketArtwork';
import type { TicketCopy } from '@/pages/yc/TicketOverlay';

export type ConcertTicketSource = {
  title: string;
  artist: string;
  venueLine: string;
  month: string;
  day: string;
  year: string;
  daysLeft?: number | null;
  city?: string;
};

type Props = {
  ticket: ConcertTicketSource;
  cycleTitle?: string | null;
  /** `blue` = flat CSS gradient; `mesh` = original orange MeshGradient */
  tone?: 'blue' | 'mesh';
};

function buildConcertCopy(
  ticket: ConcertTicketSource,
  cycleTitle?: string | null,
): TicketCopy {
  const venue = ticket.venueLine.trim() || 'TBA';
  const city = ticket.city?.trim();
  const place = city ? `${venue}, ${city}` : venue;
  const dayNum = String(ticket.day).replace(/\D/g, '') || ticket.day;
  const cycle = (cycleTitle || 'WORLD TOUR').trim();

  return {
    headline: ticket.title,
    kickerTop: 'JYP ENTERTAINMENT PRESENTS',
    kickerBottom: /[a-z]/i.test(cycle) ? cycle.toUpperCase() : cycle,
    footer: place,
    stubLayout: 'date',
    month: ticket.month,
    day: dayNum,
    year: ticket.year,
    daysLeft: ticket.daysLeft ?? null,
    titleAttr: `${ticket.artist} · ${ticket.title}`,
    descAttr: `${ticket.title} at ${place} on ${ticket.year}-${ticket.month}-${dayNum}`,
  };
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  return reduced;
}

/** Mesh-gradient concert ticket under the flat NEXT COMING stubs. */
export default function NewNewArtworkTicket({
  ticket,
  cycleTitle,
  tone = 'blue',
}: Props) {
  const reduced = useReducedMotion();
  const copy = useMemo(
    () => buildConcertCopy(ticket, cycleTitle),
    [ticket, cycleTitle],
  );

  const fontBoost =
    tone === 'blue' ? { body: 5, countdown: 9 } : { body: 6, countdown: 8 };

  return (
    <Link
      to="/schedules"
      className={`newnew-yc-ticket newnew-yc-ticket--${tone}`}
      aria-label={`${ticket.artist} ${ticket.title} ticket`}
    >
      <TicketArtwork
        name={ticket.title}
        reduced={reduced}
        copy={copy}
        fontBoost={fontBoost}
        layout={tone === 'blue' ? 'compact' : 'default'}
      />
    </Link>
  );
}
