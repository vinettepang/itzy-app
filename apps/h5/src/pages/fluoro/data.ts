import site from './data/site.json';

export type FluoroGallery = {
  title: string;
  href: string;
  images: string[];
};

export type FluoroClient = {
  name: string;
  hoverImg: string;
  tags: string[];
  galleries: FluoroGallery[];
};

export const FLUORO_BASE = '/fluoro';

export const FILTERS = [
  'All',
  'Brand Strategy',
  'Brand Identity',
  'Advertising',
] as const;

export type FluoroFilter = (typeof FILTERS)[number];

export const CLIENTS = site.clients as FluoroClient[];
