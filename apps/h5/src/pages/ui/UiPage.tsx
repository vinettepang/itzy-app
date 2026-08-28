import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { request, resolveMediaUrl } from '@/services/request';
import tourPosterWebp from '@/assets/tour-poster.webp';
import NewNewArtworkTicket from '@/pages/newnew/NewNewArtworkTicket';
import '@/pages/XkmPage.css';
import '@/pages/newnew/newnew.css';
import './ui.css';

type ScheduleVenueBrief = {
  id: string;
  posterDisplayName: string;
  city: string;
  countryName: string;
};

type HomeSchedule = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  coverUrl?: string | null;
  startsAt: string;
  highlighted: boolean;
  venue?: ScheduleVenueBrief | null;
};

type HomeSchedulesPayload = {
  today: HomeSchedule[];
  featured: HomeSchedule[];
  comeback: HomeSchedule[];
  tourSpotlight: HomeSchedule | null;
  tourSpotlightCycleTitle: string | null;
};

function fmtMonthDay(iso: string) {
  const d = new Date(iso);
  const month = d
    .toLocaleString('zh-CN', { month: 'numeric' })
    .replace(/\D/g, '');
  const day = d.toLocaleString('zh-CN', { day: '2-digit' });
  return { month: month || String(d.getMonth() + 1), day };
}

function diffDays(fromIso: string) {
  const now = Date.now();
  const t = new Date(fromIso).getTime();
  if (!Number.isFinite(t)) return null;
  const ms = t - now;
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

function collectTicketSchedules(data: HomeSchedulesPayload | null): HomeSchedule[] {
  const candidates: HomeSchedule[] = [];
  if (data?.tourSpotlight) candidates.push(data.tourSpotlight);
  candidates.push(...(data?.featured ?? []));
  candidates.push(...(data?.today ?? []));
  candidates.push(...(data?.comeback ?? []));
  const seen = new Set<string>();
  return candidates.filter((s) => {
    if (seen.has(s.id)) return false;
    seen.add(s.id);
    return true;
  });
}

function buildTicketFromSchedule(pick: HomeSchedule) {
  const { month, day } = fmtMonthDay(pick.startsAt);
  const venueLine = pick.venue?.posterDisplayName
    ? `${pick.venue.posterDisplayName}`
    : pick.location
      ? `${pick.location}`
      : '';
  const cover = pick.coverUrl ? resolveMediaUrl(pick.coverUrl) : '';
  return {
    title: pick.title,
    artist: 'ITZY',
    venueLine,
    month,
    day,
    year: String(new Date(pick.startsAt).getFullYear()),
    daysLeft: diffDays(pick.startsAt),
    posterUrl: cover || tourPosterWebp,
    city: pick.venue?.city,
  };
}

/** UI sandbox — newnew artwork tickets (blue + mesh). */
export default function UiPage() {
  const [data, setData] = useState<HomeSchedulesPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErr(null);
    void (async () => {
      try {
        const res = await request<HomeSchedulesPayload>({
          url: '/api/schedules/home?limit=12',
          method: 'GET',
        });
        if (cancelled) return;
        if (res.code === 0 && res.data && !Array.isArray(res.data)) {
          setData(res.data);
        } else {
          setData({
            today: [],
            featured: [],
            comeback: [],
            tourSpotlight: null,
            tourSpotlightCycleTitle: null,
          });
        }
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const ticket = useMemo(() => {
    const schedules = collectTicketSchedules(data);
    if (!schedules.length) return null;
    return buildTicketFromSchedule(schedules[0]);
  }, [data]);

  return (
    <div className="ui-page">
      <header className="ui-page__header">
        <h1 className="ui-page__title">UI</h1>
        <Link to="/menu" className="ui-page__back">
          Menu →
        </Link>
      </header>

      <div className="newnew-page">
        <div className="xkm xkm--new-home">
          <section className="ui-page__section xkm-ticketBlock" aria-label="Ticket preview">
            <p className="ui-page__label xkm-ticketBlock__title">
              <span>NEXT COMING</span>
            </p>
            {loading ? <p className="ui-page__muted xkm-muted">Loading…</p> : null}
            {err ? <p className="ui-page__err xkm-err">{err}</p> : null}
            {ticket ? (
              <div className="xkm-ticketList">
                <NewNewArtworkTicket
                  ticket={ticket}
                  cycleTitle={data?.tourSpotlightCycleTitle}
                  tone="blue"
                />
                <NewNewArtworkTicket
                  ticket={ticket}
                  cycleTitle={data?.tourSpotlightCycleTitle}
                  tone="mesh"
                />
              </div>
            ) : !loading && !err ? (
              <p className="ui-page__muted xkm-muted">No upcoming schedule</p>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
