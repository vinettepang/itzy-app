import { useEffect, useState } from 'react';
import { request } from '@/services/request';
import { useScrollDamping } from '@/hooks/useScrollDamping';
import './SchedulesPage.css';

type Tag = { id: string; name: string };
type ScheduleTagLink = { tag: Tag };
type ScheduleVenueBrief = {
  id: string;
  posterDisplayName: string;
  city: string;
  countryName: string;
};
type Schedule = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  coverUrl?: string | null;
  startsAt: string;
  endsAt: string | null;
  published: boolean;
  highlighted?: boolean;
  venue?: ScheduleVenueBrief | null;
  tags: ScheduleTagLink[];
};

/** 行标题：场馆名 · 城市名；缺场馆信息时退回地点 / 标题 */
function scheduleTitle(s: Schedule): string {
  const venue = s.venue?.posterDisplayName?.trim();
  const city = s.venue?.city?.trim();
  if (venue && city) return `${venue} · ${city}`;
  if (venue) return venue;
  const location = s.location?.trim();
  if (location && city) return `${location} · ${city}`;
  if (location) return location;
  return s.title;
}

export default function SchedulesPage() {
  // 与 /setlist、/cheer 等二级页保持一致：用 Lenis 接管滚动，
  // 避免全局 CSS（html height:100% / overscroll-behavior 等）影响原生滚动
  useScrollDamping();

  // 打包后的 CSS 里有全局 `body { overflow: hidden }`，会把 body 变成
  // 不可用户滚动的滚动容器，导致触摸/手势滑动失效（Lenis 只接管 wheel）。
  // 本页显式放开，卸载时还原。
  useEffect(() => {
    const body = document.body;
    const prevOverflow = body.style.overflow;
    body.style.overflow = 'visible';
    return () => {
      body.style.overflow = prevOverflow;
    };
  }, []);

  const [list, setList] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErr(null);
    void (async () => {
      try {
        const res = await request<Schedule[]>({ url: '/api/schedules', method: 'GET' });
        if (cancelled) return;
        if (res.code !== 0) {
          setErr(res.message || '加载失败');
          setList([]);
          return;
        }
        setList(res.data ?? []);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : String(e));
        if (!cancelled) setList([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="schedules-page">
      <header className="schedules-header">
        <div className="schedules-header-title">全部行程</div>
        <div className="schedules-header-sub">Schedules</div>
      </header>

      {loading ? <div className="schedules-muted">加载中…</div> : null}
      {err ? <div className="schedules-err">{err}</div> : null}

      {!loading && !err && list.length === 0 ? (
        <div className="schedules-muted">暂无已发布行程</div>
      ) : null}

      <div className="schedules-list">
        {list.map((s) => {
          const title = scheduleTitle(s);
          return (
            <div key={s.id} className="schedules-row">
              <div className="schedules-title" title={title}>
                {title}
              </div>
              {s.tags.length > 0 ? (
                <div className="schedules-tags" aria-label="Tags">
                  {s.tags.map((x) => (
                    <span key={x.tag.id} className="schedules-tag">
                      {x.tag.name}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
