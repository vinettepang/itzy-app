import albumLocalDemo from './album-local-demo.json';
import schedulesTemplate from './schedules.json';
import catalogJson from '@/data/wdzy_twinzy_catalog.json';
import { buildDollGallery } from '@/pages/unseen/buildDollGallery';
import type { DollCatalog } from '@/types/dollCatalog';

type JsonSchedule = (typeof schedulesTemplate)[number];

function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T;
}

/** 将模板里的行程时间锚定到「今天」起算的本地日期，便于首页分区与海报级联有数据 */
function buildSchedulesList(): JsonSchedule[] {
  const raw = schedulesTemplate as JsonSchedule[];
  const list = clone(raw);
  const now = new Date();
  const y = now.getFullYear();
  const mo = now.getMonth();
  const day = now.getDate();
  const at = (offsetDay: number, h: number, min = 0) =>
    new Date(y, mo, day + offsetDay, h, min, 0, 0).toISOString();

  if (list[0]) list[0].startsAt = at(0, 19, 0);
  if (list[1]) list[1].startsAt = at(0, 14, 30);
  if (list[2]) list[2].startsAt = at(3, 18, 0);
  if (list[3]) list[3].startsAt = at(10, 19, 0);
  if (list[4]) list[4].startsAt = at(0, 12, 0);
  if (list[5]) list[5].startsAt = at(3, 20, 0);
  if (list[6]) list[6].startsAt = at(20, 17, 0);
  return list;
}

function buildSchedulesHome() {
  const list = buildSchedulesList();
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  const startMs = startOfToday.getTime();
  const endMs = endOfToday.getTime();

  const today = list
    .filter((s) => {
      const t = new Date(s.startsAt).getTime();
      return t >= startMs && t < endMs;
    })
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  const featured = list
    .filter((s) => {
      if (!s.highlighted) return false;
      const t = new Date(s.startsAt).getTime();
      return t < startMs || t >= endMs;
    })
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    .slice(0, 20);

  const comeback = list
    .filter((s) => s.comebackOnHome)
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    .slice(0, 20);

  const tourSpotlight = list.find((s) => s.id === 'mock-sch-tour-spot') ?? null;
  const tc = tourSpotlight?.tourCycle as { title?: string } | null | undefined;
  const tourSpotlightCycleTitle = tc?.title ?? 'TUNNEL VISION 世巡';

  return {
    today,
    featured,
    comeback,
    tourSpotlight,
    tourSpotlightCycleTitle,
  };
}

function parsePath(url: string): string {
  const q = url.indexOf('?');
  const path = (q >= 0 ? url.slice(0, q) : url).replace(/^\/api/, '') || '/';
  return path.startsWith('/') ? path : `/${path}`;
}

/**
 * 返回与 Nest `ok(data)` 一致的外壳；未实现的 method/path 返回 null，由上层决定是否抛错。
 */
export function tryMockApiResponse(url: string, method: string): { code: number; data: unknown; message: string } | null {
  const m = (method || 'GET').toUpperCase();
  if (m !== 'GET') {
    return null;
  }
  const path = parsePath(url);

  if (path === '/schedules/home' || path.startsWith('/schedules/home/')) {
    return { code: 0, data: buildSchedulesHome(), message: 'ok' };
  }
  if (path === '/schedules') {
    return { code: 0, data: buildSchedulesList(), message: 'ok' };
  }
  if (path === '/dolls/gallery') {
    const catalog = clone(catalogJson) as DollCatalog;
    return {
      code: 0,
      data: {
        meta: catalog.meta,
        dolls: buildDollGallery(catalog),
      },
      message: 'ok',
    };
  }
  if (path === '/dolls/catalog') {
    return { code: 0, data: clone(catalogJson), message: 'ok' };
  }
  const albumMatch = path.match(/^\/albums\/([^/]+)$/);
  if (albumMatch) {
    const id = albumMatch[1];
    const demo = albumLocalDemo as { id: string };
    if (id === demo.id) {
      return { code: 0, data: clone(albumLocalDemo), message: 'ok' };
    }
    return { code: 404, data: null, message: 'Album not found' };
  }

  return null;
}
