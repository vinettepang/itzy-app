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

function Section({
  title,
  list,
}: {
  title: string;
  list: HomeSchedule[];
}) {
  if (!list.length) return null;
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
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

