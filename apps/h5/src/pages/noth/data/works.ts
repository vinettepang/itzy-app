import { nothAsset } from '../paths';

export type NothWork = {
  slug: string;
  name: string;
  tagline: string;
  image: string;
  aspectRatio: string;
  gridArea?: string;
};

/** 首页作品列表（与归档 HTML 一致，可运行 scripts/tmp-extract-works.mjs 更新） */
export const NOTH_HOME_WORKS: NothWork[] = [
  {
    slug: 'utopia',
    name: 'Utopia',
    tagline: 'A speculative atlas of desirable futures.',
    image: nothAsset('6280efb020dd-6a319bce1522d2bb4973451c_work-vignette-aurbse-V2.webp'),
    aspectRatio: '253 / 241',
    gridArea: 'auto / 1 / auto / 5',
  },
  {
    slug: 'aurbse',
    name: 'Aurbse',
    tagline: 'A living instrument for reading territory.',
    image: nothAsset('6280efb020dd-6a319bce1522d2bb4973451c_work-vignette-aurbse-V2.webp'),
    aspectRatio: '253 / 241',
    gridArea: 'auto / 3 / auto / 7',
  },
  {
    slug: 'in-cognita',
    name: 'In_Cognita',
    tagline: 'Seize the unexpected: the invisible, made visible.',
    image: nothAsset('32c78557b7be-6a319be381e9a44c6244424b_work-vignette-in-cognita-V3.jpg'),
    aspectRatio: '343 / 550',
    gridArea: 'auto / 1 / auto / 7',
  },
  {
    slug: 'lgm',
    name: 'Lgm',
    tagline: 'Swiss clarity for French engineering.',
    image: nothAsset('49efbe8f8bd4-6a319c01066b4f2379f3db78_work-vignette-lgm-V2.jpg'),
    aspectRatio: '1 / 1',
    gridArea: 'auto / 1 / auto / 7',
  },
  {
    slug: 'haptify',
    name: 'Haptify',
    tagline: 'Branding the forgotten sense.',
    image: nothAsset('8b8d4b8de197-6a319bf45a0a1fa70477531a_work-vignette-haptify-V2.webp'),
    aspectRatio: '253 / 241',
    gridArea: 'auto / 1 / auto / 5',
  },
];
