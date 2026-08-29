import { useEffect, useState } from 'react';
import { request } from '@/services/request';
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

export default function SchedulesPage() {
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
        {list.map((s) => (
          <div key={s.id} className="schedules-row">
            <div className="schedules-title" title={s.title}>
              {s.title}
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
        ))}
      </div>
    </div>
  );
}
