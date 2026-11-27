/**
 * 默认使用 `runtime/` React 实现；仅当 `VITE_NOTH_LEGACY_MAIN=true` 时加载整包 main.spa.js。
 *
 * 还原路线见同目录 `MIGRATION.md`。
 */
/** 仅当 `.env` 显式 `VITE_NOTH_LEGACY_MAIN=true` 时加载整包 main.spa.js */
export const NOTH_LEGACY_MAIN = import.meta.env.VITE_NOTH_LEGACY_MAIN === 'true';

/** 后续可按模块关掉 legacy 依赖，例如 `microInteractions: true` 表示已用 React 实现 */
export const NOTH_RUNTIME_MODULES = {
  lenis: true,
  reveals: true,
  scrollMotion: true,
  showreel: true,
  scrollRefresh: true,
  heroVideo: true,
  loader: true, // P2: vM 时间轴 + heroReveal 事件
  heroReveal: true,
  microInteractions: true,
  navLogo: true,
  menu: true,
  heroWebgl: true,
  worksSection: true,
  studioMusee: true,
  formes: true,
  glitch: true,
  footerSvg: true,
  videoIo: true,
} as const;
