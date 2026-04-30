/**
 * Webpack 对 png 常输出为 `assets/xxx.png`（无 / 前缀）。
 * 小程序里相对路径会相对「当前页目录」解析，导致找不到包内资源；
 * Canvas / getImageInfo 需使用以「小程序根目录」为基准的路径，即 `/assets/xxx.png`。
 */
export function normalizeMiniProgramAssetPath(src: string): string {
  if (!src) return src;
  if (
    /^https?:\/\//i.test(src) ||
    src.startsWith('data:') ||
    src.startsWith('wxfile://') ||
    src.startsWith('http://tmp/') ||
    src.startsWith('https://tmp/')
  ) {
    return src;
  }
  return src.startsWith('/') ? src : `/${src}`;
}
