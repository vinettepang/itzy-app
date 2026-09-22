import site from './data/site.json';

export type HelioMedia = {
  id?: number;
  hash: string;
  name: string;
  file_type?: string;
  mime_type?: string;
  width?: number;
  height?: number;
  is_image?: boolean;
  is_video?: boolean;
  duration?: number | null;
  src: string;
  poster?: string | null;
  local?: string;
};

export type HelioPageData = {
  id: string;
  title: string;
  purl: string;
  content: string;
  local_css: string;
  display: boolean;
  pin: boolean;
  media: HelioMedia[];
};

export const HELIO_BASE = '/helioteles';

const pages = site.pages as Record<string, HelioPageData>;
const mediaIndex = (site.media || {}) as Record<string, HelioMedia | string>;

export const helioPages = pages;
export const helioSite = site.site;

const byPurl = new Map<string, HelioPageData>();
const mediaByHashMap = new Map<string, HelioMedia>();

function isVideoPath(value: string, fileType?: string) {
  return Boolean(
    fileType === 'mp4' ||
      fileType === 'webm' ||
      /\/v\/|\.mp4(\?|$)/i.test(value),
  );
}

function freightSrc(hash: string, name: string, video: boolean) {
  const file = encodeURIComponent(name || `${hash}.jpg`);
  return video
    ? `https://freight.cargo.site/t/original/v/${hash}/${file}`
    : `https://freight.cargo.site/w/1600/i/${hash}/${file}`;
}

function resolveMediaSrc(hash: string, rec?: Partial<HelioMedia> | string): HelioMedia {
  if (typeof rec === 'string') {
    const video = isVideoPath(rec);
    const name = rec.split('/').pop() || `${hash}.jpg`;
    return {
      hash,
      name,
      src: rec.startsWith('http') ? rec : freightSrc(hash, name, video),
      is_video: video,
    };
  }

  const name = rec?.name || rec?.local?.split('/').pop() || `${hash}.jpg`;
  const video = Boolean(rec?.is_video) || isVideoPath(rec?.src || rec?.local || '', rec?.file_type);
  const raw = rec?.src || rec?.local || '';
  return {
    hash,
    name,
    file_type: rec?.file_type,
    mime_type: rec?.mime_type,
    width: rec?.width,
    height: rec?.height,
    is_image: rec?.is_image,
    is_video: video,
    duration: rec?.duration ?? null,
    poster: rec?.poster ?? null,
    src: raw.startsWith('http') ? raw : freightSrc(hash, name, video),
  };
}

for (const page of Object.values(pages)) {
  if (page.purl) byPurl.set(page.purl, page);
  for (const item of page.media || []) {
    if (item?.hash) mediaByHashMap.set(item.hash, resolveMediaSrc(item.hash, item));
  }
}

for (const [hash, rec] of Object.entries(mediaIndex)) {
  if (!mediaByHashMap.has(hash)) mediaByHashMap.set(hash, resolveMediaSrc(hash, rec));
}

export const helioMedia = Object.fromEntries(mediaByHashMap);

export function pageByPurl(purl: string): HelioPageData | undefined {
  return byPurl.get(purl);
}

export function mediaByHash(hash: string): HelioMedia | undefined {
  const cached = mediaByHashMap.get(hash);
  if (cached) return cached;
  const rec = mediaIndex[hash];
  if (rec == null) return undefined;
  const resolved = resolveMediaSrc(hash, rec);
  mediaByHashMap.set(hash, resolved);
  return resolved;
}

export function resolveHelioPath(href: string | null, rel: string | null): string | null {
  if (!href) return null;
  if (rel === 'home-page' || href === '#' || href === '#home-1') return HELIO_BASE;
  if (/^(mailto:|https?:|tel:)/i.test(href)) return href;
  if (href === 'about' || href === 'about-mobile') return `${HELIO_BASE}/about`;
  if (href === 'index-mobile') return `${HELIO_BASE}?index=1`;
  if (href.startsWith('/')) return href;
  return `${HELIO_BASE}/${href}`;
}

export function slugToPurl(slug?: string): string {
  if (!slug || slug === 'home' || slug === 'home-1') return byPurl.has('home-1') ? 'home-1' : 'home';
  if (slug === 'about-mobile') return 'about';
  if (slug === 'index-desktop' || slug === 'index-mobile') return 'index-desktop';
  return decodeURIComponent(slug);
}

export function pageBackground(page?: HelioPageData): string {
  const css = page?.local_css || '';
  const block = css.match(/\[id="[^"]+"\]\.page\s*\{([^}]+)\}/);
  const raw = block?.[1]?.match(/background-color:\s*([^;]+)/)?.[1]?.trim();
  if (!raw || raw === 'transparent' || /rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0/i.test(raw) || /rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0/i.test(raw)) {
    return '#ffffff';
  }
  return raw;
}
