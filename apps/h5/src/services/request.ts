import { USE_LIVE_API } from '@/config/dataSource';
import { tryMockApiResponse } from '@/mock-data/mockApi';

export function getApiBase(): string {
  const raw = import.meta.env.VITE_API_BASE?.trim();
  const base = (raw && raw.length > 0 ? raw : 'http://127.0.0.1:3000').replace(/\/$/, '');
  return base;
}

/**
 * 将接口返回的图片地址转为当前 API 主机下的绝对 URL。
 */
export function resolveMediaUrl(raw: string | null | undefined): string {
  if (raw == null) return '';
  const s = String(raw).trim();
  if (!s) return '';
  const base = getApiBase();
  if (s.startsWith('/')) return `${base}${s}`;
  try {
    const u = new URL(s);
    if (u.pathname.startsWith('/uploads/')) {
      return `${base}${u.pathname}${u.search}`;
    }
    return s;
  } catch {
    return s;
  }
}

export function describeRequestFailure(err: unknown): string {
  const e = err as { message?: string; name?: string };
  const detail = (e.message || String(err)).trim();
  const base = getApiBase();
  const hint =
    'H5：需在小程序「合法域名」外使用 mock；真实接口时请配置 VITE_API_BASE，并处理好 CORS（Nest 放行 Origin）。';
  return `${detail || '请求失败'}\n\nAPI：${base}\n${hint}`;
}

export async function request<T>(options: {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: Record<string, unknown>;
  header?: Record<string, string>;
}): Promise<{ code: number; data: T; message: string }> {
  if (!USE_LIVE_API) {
    const mock = tryMockApiResponse(options.url, options.method ?? 'GET');
    if (mock !== null) {
      return mock as { code: number; data: T; message: string };
    }
    throw new Error(`本地模式未配置 Mock：${options.method ?? 'GET'} ${options.url}`);
  }

  const base = getApiBase();
  const url = `${base}${options.url}`;
  const method = options.method ?? 'GET';
  const ctl = new AbortController();
  const timer = window.setTimeout(() => ctl.abort(), 20000);

  try {
    const res = await fetch(url, {
      method,
      headers: { 'content-type': 'application/json', ...(options.header ?? {}) },
      body:
        options.data && method !== 'GET'
          ? JSON.stringify(options.data)
          : undefined,
      signal: ctl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return (await res.json()) as { code: number; data: T; message: string };
  } catch (err) {
    clearTimeout(timer);
    throw new Error(describeRequestFailure(err));
  }
}
