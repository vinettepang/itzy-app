/**
 * 静态资源路径工具：把以 / 开头的 public 资源路径转换为当前部署 base 下的绝对路径。
 *
 * 本地开发 base 为 '/'，行为不变；GitHub Pages 等子路径部署（base=/itzy-app/）时
 * 自动补全前缀，避免浏览器请求到站点根导致 404（如 glb 模型、贴图加载失败）。
 */
const BASE = import.meta.env.BASE_URL || '/';

export function assetUrl(path: string): string {
  // 外链、协议相对地址、data URI 原样返回
  if (/^(https?:)?\/\//i.test(path) || path.startsWith('data:')) return path;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${BASE.replace(/\/$/, '')}${p}`;
}
