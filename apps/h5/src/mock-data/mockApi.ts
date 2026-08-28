import albumLocalDemo from './album-local-demo.json';
import schedulesTemplate from './schedules.json';
import catalogJson from '@/data/wdzy_twinzy_catalog.json';
import { buildDollGallery } from '@/pages/unseen/buildDollGallery';
import type { DollCatalog } from '@/types/dollCatalog';

type JsonSchedule = (typeof schedulesTemplate)[number];

function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T;
}

/** 使用 schedules.json 中的真实巡演日期 */
function buildSchedulesList(): JsonSchedule[] {
  return clone(schedulesTemplate as JsonSchedule[]);
}

function pickTourSpotlight(list: JsonSchedule[]): {
  tourSpotlight: JsonSchedule | null;
  tourSpotlightCycleTitle: string;
} {
  const cycleTitle = 'TUNNEL VISION 世巡';
  const inCycle = list.filter((s) => s.tourCycleId);
  if (!inCycle.length) {
    return { tourSpotlight: null, tourSpotlightCycleTitle: cycleTitle };
  }
  const now = Date.now();
  const byAsc = [...inCycle].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  );
  const upcoming = byAsc.find((s) => new Date(s.startsAt).getTime() >= now);
  const tourSpotlight = upcoming ?? byAsc[byAsc.length - 1] ?? null;
  const tc = tourSpotlight?.tourCycle as { title?: string } | null | undefined;
  return {
    tourSpotlight,
    tourSpotlightCycleTitle: tc?.title ?? cycleTitle,
  };
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

  const { tourSpotlight, tourSpotlightCycleTitle } = pickTourSpotlight(list);

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
