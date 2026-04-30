/** 与小程序一致：用本机局域网 IP，真机才能访问开发机上的 Nest */
const defaultBase = 'http://192.168.1.100:3000';

export function apiBase(): string {
  if (typeof window !== 'undefined') {
    return (window.localStorage.getItem('api_base') || process.env.NEXT_PUBLIC_API_BASE || defaultBase).replace(
      /\/$/,
      '',
    );
  }
  return (process.env.NEXT_PUBLIC_API_BASE || defaultBase).replace(/\/$/, '');
}

/** 写入 localStorage，供管理端请求与上传使用（不含末尾 `/`） */
export function setStoredApiBase(url: string): void {
  if (typeof window === 'undefined') return;
  const normalized = url.trim().replace(/\/$/, '');
  window.localStorage.setItem('api_base', normalized);
}

export function getStoredJwt(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('admin_jwt');
}

/** 上传资源在库里多为 `/uploads/...`；历史数据可能带错误 LAN 的绝对 URL，统一用当前管理端 API 主机解析 */
export function resolveMediaUrl(raw: string | null | undefined): string {
  if (raw == null) return '';
  const s = String(raw).trim();
  if (!s) return '';
  const base = apiBase().replace(/\/$/, '');
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

export async function apiFetch<T>(
  path: string,
  opts: {
    method?: string;
    body?: BodyInit;
    headers?: Record<string, string>;
    /** 登录/注册/bootstrap 等无需鉴权的请求 */
    skipAuth?: boolean;
  } = {},
): Promise<{ code: number; data: T; message: string }> {
  const headers: Record<string, string> = { ...opts.headers };
  if (!opts.skipAuth) {
    const jwt = getStoredJwt();
    if (jwt) {
      headers.authorization = `Bearer ${jwt}`;
    }
  }
  const isForm = opts.body instanceof FormData;
  if (!isForm && opts.body && !headers['content-type']) {
    headers['content-type'] = 'application/json';
  }
  const res = await fetch(`${apiBase()}${path}`, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body,
  });
  return (await res.json()) as { code: number; data: T; message: string };
}
