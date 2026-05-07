import { useEffect, useState } from 'react';
import { request, resolveMediaUrl } from '@/services/request';
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
      <div className="schedules-header">
        <div className="schedules-header-title">全部行程</div>
        <div className="schedules-header-sub">与小程序端对应：读取 `/api/schedules`（默认 mock）。</div>
      </div>

      {loading ? <div className="schedules-muted">加载中…</div> : null}
      {err ? <div className="schedules-err">{err}</div> : null}

      {!loading && !err && list.length === 0 ? <div className="schedules-muted">暂无已发布行程</div> : null}

      <div className="schedules-list">
        {list.map((s) => (
          <div key={s.id} className="schedules-card">
            {s.highlighted ? <div className="schedules-pick">精选</div> : null}
            {s.coverUrl ? <img className="schedules-cover" src={resolveMediaUrl(s.coverUrl)} alt="" /> : null}
            <div className="schedules-title">{s.title}</div>
            <div className="schedules-time">
              {new Date(s.startsAt).toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
              {s.endsAt
                ? ` — ${new Date(s.endsAt).toLocaleString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
                : ''}
            </div>
            {s.location ? <div className="schedules-loc">{s.location}</div> : null}
            {s.venue ? <div className="schedules-loc">场馆：{s.venue.posterDisplayName}（{s.venue.city}）</div> : null}
            {s.description ? <div className="schedules-desc">{s.description}</div> : null}
            <div className="schedules-tags">
              {s.tags.map((x) => (
                <span key={x.tag.id} className="schedules-tag">
                  {x.tag.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

