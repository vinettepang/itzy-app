import Taro from '@tarojs/taro';
import { USE_LIVE_API } from '@/config/dataSource';
import { tryMockApiResponse } from '@/mock-data/mockApi';

const FALLBACK_BASE = 'http://10.0.112.146:3000';

export function getApiBase(): string {
  return FALLBACK_BASE;
  // return typeof TARO_APP_API !== 'undefined' ? FALLBACK_BASE : FALLBACK_BASE;
}

/**
 * 将接口返回的图片地址转为当前小程序请求的 API 主机下的绝对 URL。
 * 上传接口若曾写入固定 LAN IP（如 192.168.x.x），会与 getApiBase() 不一致导致 <Image> 无法显示；
 * 对 `/uploads/...` 路径或任意主机上的 `/uploads/...` 统一拼到当前 base。
 */
export function resolveMediaUrl(raw: string | null | undefined): string {
  if (raw == null) return '';
  const s = String(raw).trim();
  if (!s) return '';
  const base = getApiBase().replace(/\/$/, '');
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

/** 把 Taro.request 失败原因拼成可读文案，便于真机排查 */
export function describeRequestFailure(err: unknown): string {
  const e = err as { errMsg?: string; message?: string };
  const detail = (e.errMsg || e.message || String(err)).trim();
  const base = getApiBase();
  const hint =
    '真机：与电脑同一 WiFi；微信开发者工具「详情→本地设置」勾选不校验合法域名；用「真机调试」或小程序内「打开调试」；本机防火墙放行端口；编译时 IP 与 TARO_APP_API 一致。';
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
  try {
    const res = await Taro.request({
      url: `${base}${options.url}`,
      method: options.method ?? 'GET',
      data: options.data,
      header: { 'content-type': 'application/json', ...options.header },
      timeout: 20000,
    });
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw new Error(`HTTP ${res.statusCode}`);
    }
    return res.data as { code: number; data: T; message: string };
  } catch (err) {
    throw new Error(describeRequestFailure(err));
  }
}
