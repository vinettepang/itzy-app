import { useEffect, useMemo, useState } from 'react';
import { request } from '@/services/request';
import { useScrollDamping } from '@/hooks/useScrollDamping';
import { cityEn, venueEn } from './scheduleNames';
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

const MONTHS = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
];

/** 用 UTC 取日期，避免时区把演出日算偏一天（数据以 12:00Z 记录当天） */
function utcDay(iso: string) {
  const d = new Date(iso);
  return {
    y: d.getUTCFullYear(),
    m: d.getUTCMonth(),
    d: d.getUTCDate(),
    t: Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;

function isConsecutive(a: { t: number }, b: { t: number }) {
  return b.t - a.t === DAY_MS;
}

/** 单日 → "FEB 13"；连续多日 → "FEB 13–15"；跨月 → "FEB 28–MAR 02" */
function formatDays(days: ReturnType<typeof utcDay>[]): string {
  if (days.length === 0) return '';
  const first = days[0];
  const last = days[days.length - 1];
  const pad = (n: number) => String(n).padStart(2, '0');

  if (days.length === 1 || first.t === last.t) {
    return `${MONTHS[first.m]} ${pad(first.d)}`;
  }

  // 连续：只显示首尾，用短横线连接
  const allConsecutive = days.every((day, i) => i === 0 || isConsecutive(days[i - 1], day));
  if (allConsecutive) {
    if (first.m === last.m && first.y === last.y) {
      return `${MONTHS[first.m]} ${pad(first.d)}–${pad(last.d)}`;
    }
    return `${MONTHS[first.m]} ${pad(first.d)} – ${MONTHS[last.m]} ${pad(last.d)}`;
  }

  // 不连续：逐日列出
  return days.map((day) => `${MONTHS[day.m]} ${pad(day.d)}`).join(', ');
}

type ScheduleEntry = {
  key: string;
  venue: string;
  city: string;
  dateLabel: string;
  tags: Tag[];
  sortKey: number;
};

/** 同一场馆（连续或不同日期）合并为一条，日期合并成区间 */
function buildEntries(list: Schedule[]): ScheduleEntry[] {
  const groups = new Map<string, Schedule[]>();

  for (const s of list) {
    const key = s.venue?.id || `no-venue:${s.title}`;
    const bucket = groups.get(key);
    if (bucket) bucket.push(s);
    else groups.set(key, [s]);
  }

  const entries: ScheduleEntry[] = [];

  for (const [key, items] of groups) {
    const first = items[0];
    const days = [...new Set(items.map((s) => utcDay(s.startsAt).t))]
      .sort((a, b) => a - b)
      .map((t) => utcDay(new Date(t).toISOString()));

    const tagMap = new Map<string, Tag>();
    for (const s of items) {
      for (const link of s.tags ?? []) {
        if (link?.tag?.id) tagMap.set(link.tag.id, link.tag);
      }
    }

    const venue = venueEn(first.venue?.posterDisplayName);
    const city = cityEn(first.venue?.city);

    entries.push({
      key,
      venue: venue || first.title,
      city,
      dateLabel: formatDays(days),
      tags: [...tagMap.values()],
      sortKey: days[0]?.t ?? 0,
    });
  }

  return entries.sort((a, b) => a.sortKey - b.sortKey);
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

  const entries = useMemo(() => buildEntries(list), [list]);

  return (
    <div className="schedules-page">
      <header className="schedules-header">
        <div className="schedules-header-title">Tour Dates</div>
        <div className="schedules-header-sub">{entries.length} shows</div>
      </header>

      {loading ? <div className="schedules-muted">加载中…</div> : null}
      {err ? <div className="schedules-err">{err}</div> : null}

      {!loading && !err && entries.length === 0 ? (
        <div className="schedules-muted">暂无已发布行程</div>
      ) : null}

      <div className="schedules-list">
        {entries.map((entry) => {
          const title = entry.city ? `${entry.venue} · ${entry.city}` : entry.venue;
          return (
            <div key={entry.key} className="schedules-row">
              <div className="schedules-title" title={title}>
                {title}
              </div>
              <div className="schedules-meta">
                {entry.dateLabel ? (
                  <span className="schedules-date">{entry.dateLabel}</span>
                ) : null}
                {entry.tags.length > 0 ? (
                  <div className="schedules-tags" aria-label="Tags">
                    {entry.tags.map((tag) => (
                      <span key={tag.id} className="schedules-tag">
                        {tag.name}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
