import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { request } from '@/services/request';
import './GalleryHome.css';

type Tag = { id: string; name: string };
type ScheduleTagLink = { tag: Tag };
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
  tags: ScheduleTagLink[];
};
type HomeSchedulesPayload = {
  today: HomeSchedule[];
  featured: HomeSchedule[];
  comeback: HomeSchedule[];
  tourSpotlight: HomeSchedule | null;
  tourSpotlightCycleTitle: string | null;
};

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function fmtMonthDay(iso: string) {
  const d = new Date(iso);
  const month = d.toLocaleString('zh-CN', { month: 'numeric' }).replace(/\D/g, '');
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

function Section({
  title,
  list,
}: {
  title: string;
  list: HomeSchedule[];
}) {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!list.length) return;
    const root = rootRef.current;
    if (!root) return;
    const prefersReduce =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduce) {
      root.querySelectorAll<HTMLElement>('.card[data-anim="rise"]').forEach((el) => el.classList.add('is-in'));
      return;
    }
    const els = Array.from(root.querySelectorAll<HTMLElement>('.card[data-anim="rise"]'));
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add('is-in');
            io.unobserve(e.target);
          }
        }
      },
      { root: null, threshold: 0.12, rootMargin: '0px 0px -10% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [list]);

  if (!list.length) return null;
  return (
    <section ref={(n) => (rootRef.current = n)} className="section">
      <div className="section-head">
        <h2 className="section-title">{title}</h2>
      </div>
      <div className="cards">
        {list.slice(0, 6).map((s) => (
          <Link key={s.id} data-anim="rise" className="card" to={`/gallery/local-demo-album`}>
            <div className="card-title">{s.title}</div>
            <div className="card-sub">
              {fmtTime(s.startsAt)}
              {s.location ? ` · ${s.location}` : s.venue ? ` · ${s.venue.posterDisplayName}` : ''}
            </div>
            {s.description ? <div className="card-sub">{s.description}</div> : null}
          </Link>
        ))}
      </div>
      <div className="muted">提示：当前 H5 的相册详情使用 mock 相册 `local-demo-album` 展示图片滑动。</div>
    </section>
  );
}

export default function GalleryHome() {
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
          setData({ today: [], featured: [], comeback: [], tourSpotlight: null, tourSpotlightCycleTitle: null });
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

  const hasAny = useMemo(() => {
    return Boolean(
      (data?.today?.length ?? 0) ||
        (data?.featured?.length ?? 0) ||
        (data?.comeback?.length ?? 0) ||
        data?.tourSpotlight,
    );
  }, [data]);

  // 恢复：实验 TicketCard（用于对齐票根样式图例）
  const TicketCard = ({
    data: card,
  }: {
    data: {
      title: string;
      artist: string;
      location: string;
      date: { year: string; month: string; day: string };
      countdown: string;
      posterUrl: string;
    };
  }) => {
    const { title, artist, location, date, countdown } = card;

    return (
      <Link to="/schedules" className="ticket-card">
        <div className="ticket-poster" aria-hidden="true">
          <div className="ticket-thumb" aria-hidden="true" />
          {/* <img src={card.posterUrl} alt={`${artist} poster`} /> */}
        </div>

        <div className="ticket-info">
          <h2 className="title">{title}</h2>
          <p className="artist">{artist}</p>
          <div className="location">
            <span className="geo-icon" aria-hidden="true">
              📍
            </span>
            {location}
          </div>
        </div>

        <div className="ticket-divider" aria-hidden="true">
          {/* <div className="punch-hole top" /> */}
          <div className="dotted-line" />
          {/* <div className="punch-hole bottom" /> */}
        </div>

        <div className="ticket-date-section">
          <div className="month">{date.month}月</div>
          <div className="day">{date.day}</div>
          <div className="year-vertical">{date.year}年</div>
          <div className="countdown-badge">{countdown}天</div>
        </div>
      </Link>
    );
  };

  const eventData = {
    title: '2026-27 aespa LIVE TOUR - SYNK : CO...',
    artist: 'aespa',
    location: 'Gocheok Sky Dome',
    date: {
      year: '2026',
      month: '8',
      day: '07',
    },
    countdown: '92',
    posterUrl: 'https://images.unsplash.com/photo-1526481280695-3c687fd643ed?auto=format&fit=crop&w=240&q=60',
  };

  const ticket = useMemo(() => {
    const spotlight = data?.tourSpotlight ?? null;
    const pick = spotlight ?? data?.featured?.[0] ?? data?.today?.[0] ?? null;
    if (!pick) return null;
    const { month, day } = fmtMonthDay(pick.startsAt);
    const daysLeft = diffDays(pick.startsAt);
    const venueLine = pick.venue?.posterDisplayName
      ? `${pick.venue.posterDisplayName}`
      : pick.location
        ? `${pick.location}`
        : '';
    const count =
      (data?.today?.length ?? 0) +
      (data?.featured?.length ?? 0) +
      (data?.comeback?.length ?? 0) +
      (data?.tourSpotlight ? 1 : 0);
     
    const year = String(new Date(pick.startsAt).getFullYear());
    return {
      title: pick.title,
      artist: 'ITZY',
      venueLine,
      month,
      day,
      year,
      daysLeft,
      count,
    };
  }, [data]);

  const HybridTicketCard = () => {
    if (!ticket) return null;
    return (
      <Link to="/schedules" className="hybrid-ticket-card">
        <div className="hybrid-ticket-concert">
          <div className="hybrid-ticket-copy">
            <p className="hybrid-ticket-kicker">{ticket.artist}</p>
            <h3 className="hybrid-ticket-title">{ticket.title}</h3>
            {ticket.venueLine ? (
              <p className="hybrid-ticket-venue">
                <span className="hybrid-ticket-venue-icon" aria-hidden="true">
                  ⌁
                </span>
                <span>{ticket.venueLine}</span>
              </p>
            ) : null}
          </div>
        </div>
        <div className="hybrid-ticket-stub">
          <div className="ticket-date-section">
            <div className="month">{ticket.month}月</div>
            <div className="day">{ticket.day}</div>
            <div className="year-vertical">{ticket.year}年</div>
            {ticket.daysLeft !== null ? <div className="countdown-badge">{ticket.daysLeft}天</div> : null}
          </div>
        </div>
        <span className="hybrid-ticket-tear" aria-hidden="true" />
      </Link>
    );
  };

  return (
    <div className="home">
      <div className="hero">
        <div className="hero-kicker">MIDZY · H5</div>
        <h1 className="hero-title">行程 / 相册 / 海报</h1>
        <p className="hero-sub">
          该 H5 项目按小程序功能对应实现：首页（行程 home 聚合）、行程列表、相册详情滑动、门票海报生成与预览下载、LAB 风格页。
        </p>
        <div className="hero-actions">
          <Link className="pill primary" to="/poster">
            去做海报
          </Link>
          <Link className="pill" to="/schedules">
            查看全部行程
          </Link>
          <Link className="pill" to="/lab-style">
            打开 LAB
          </Link>
        </div>
      </div>

      {ticket ? (
        <section className="section">
          <div className="section-head">
            <h2 className="section-title">即将到来</h2>
            {ticket.count ? <span className="concert-pill">{ticket.count} 场</span> : null}
          </div>
          <div className="cards">
            <TicketCard data={eventData} />
            <Link to="/schedules" className="concert-card">
              <div className="concert-left">
                <div className="concert-thumb" aria-hidden="true" />
                <div className="concert-main">
                  <div className="concert-title">{ticket.title}</div>
                  <div className="concert-sub">{ticket.artist}</div>
                  {ticket.venueLine ? <div className="concert-sub concert-sub--muted">⌁ {ticket.venueLine}</div> : null}
                </div>
              </div>
              <div className="concert-right">
                <div className="concert-rightInner">
                  <div className="concert-month">{ticket.month}月</div>
                  <div className="concert-day">{ticket.day}</div>
                  {ticket.daysLeft !== null ? <div className="concert-badge">{ticket.daysLeft}天</div> : null}
                </div>
                <div className="concert-serial" aria-hidden="true">
                  2026
                </div>
              </div>
              <span className="concert-notch concert-notch--a" aria-hidden="true" />
              <span className="concert-notch concert-notch--b" aria-hidden="true" />
            </Link>
            <HybridTicketCard />
          </div>
        </section>
      ) : null}

      {loading ? <div className="muted">加载中…</div> : null}
      {err ? <div className="err">{err}</div> : null}

      {hasAny ? (
        <>
          <Section title="今日" list={data?.today ?? []} />
          <Section title="精选" list={data?.featured ?? []} />
          <Section title="回归" list={data?.comeback ?? []} />
          {data?.tourSpotlight ? (
            <Section title={`巡演 · ${data.tourSpotlightCycleTitle ?? ''}`} list={[data.tourSpotlight]} />
          ) : null}
        </>
      ) : !loading && !err ? (
        <div className="muted">当前没有可展示的行程内容（mock 数据为空）。</div>
      ) : null}
    </div>
  );
}

