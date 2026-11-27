export const NOTH_BASE = '/noth';

export const NOTH_ROUTES = {
  home: NOTH_BASE,
  works: `${NOTH_BASE}/works`,
  studio: `${NOTH_BASE}/studio`,
  contact: `${NOTH_BASE}/contact`,
} as const;

export function nothWorkPath(slug: string) {
  return `${NOTH_BASE}/works/${slug.replace(/^\//, '')}`;
}

const base = import.meta.env.BASE_URL || '/';
const root = base.endsWith('/') ? base : `${base}/`;

/** 静态资源（图片 / 视频 / 样式包） */
export function nothAsset(file: string) {
  return `${root}noth/assets/${file.replace(/^\//, '')}`;
}

export function nothFont(file: string) {
  return `${root}noth/fonts/${file.replace(/^\//, '')}`;
}
