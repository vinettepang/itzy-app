export type ProjectItem = {
  id: string;
  title: string;
  description: string;
  link: string;
  categories: string[];
  image: string | null;
  bg: string;
  light: boolean;
};

export type WorldItem = {
  id: string;
  type: 'image' | 'video' | string;
  title: string;
  author: string;
  link: string;
  color: string;
  file: string;
  caption: string;
  showCaption: boolean;
  size: number[];
};

export const PROJECT_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'branding', label: 'Branding' },
  { id: 'digital', label: 'Digital' },
  { id: 'motion', label: 'Motion' },
  { id: 'experiment', label: 'Experiment' },
] as const;

export type SceneView = 'home' | 'contact' | 'projects' | 'world';

/** Prefer raster for <img>; ktx2 is WebGL-only on production. */
export function displayMediaUrl(file: string): string {
  if (!file) return '';
  if (/\.ktx2$/i.test(file)) return file.replace(/\.ktx2$/i, '.jpg');
  return file;
}

/**
 * Route unseen.co media through Vite `/unseen-proxy` so WebGL TextureLoader
 * can sample cross-origin images (CDN often omits ACAO for some assets).
 */
export function proxiedMediaUrl(file: string): string {
  const url = displayMediaUrl(file);
  if (!url) return '';
  if (url.startsWith('https://unseen.co/')) {
    return `/unseen-proxy${url.slice('https://unseen.co'.length)}`;
  }
  if (url.startsWith('http://unseen.co/')) {
    return `/unseen-proxy${url.slice('http://unseen.co'.length)}`;
  }
  return url;
}

