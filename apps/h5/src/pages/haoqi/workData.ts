import { assetUrl } from '@/utils/assetUrl';
export type HaoqiWork = {
  tag?: string;
  name: string;
  year: string;
  badge?: string;
  href?: string;
  external?: boolean;
  img: string;
  hoverImg?: string;
  /** Tailwind-style 12-col placement（还原自生产 DOM） */
  gridClass: string;
  aspectRatio: string;
};

/** Work 列表（顺序/文案/网格来自 haoqi.design #selected-work） */
export const HAOQI_WORK: HaoqiWork[] = [
  {
    tag: 'Coding Project',
    name: 'Reunimos™',
    year: '2024-2026',
    href: '/reunimos',
    img: assetUrl('/haoqi-static/work/reunimos01.png'),
    hoverImg: assetUrl('/haoqi-static/work/reunimos02.png'),
    gridClass: 'haoqi__workItem--g1',
    aspectRatio: '1332 / 750',
  },
  {
    tag: 'Coding Project',
    name: 'Inspire Mono',
    year: '2025',
    href: '/inspire_mono',
    img: assetUrl('/haoqi-static/work/inspire_mono_01.png'),
    hoverImg: assetUrl('/haoqi-static/work/inspire_mono_02.png'),
    gridClass: 'haoqi__workItem--g2',
    aspectRatio: '3840 / 2160',
  },
  {
    tag: 'Coding Project',
    name: 'Wasm design utils',
    year: '2025',
    href: '/wasm_design_utils',
    img: assetUrl('/haoqi-static/work/wasm01.png'),
    hoverImg: assetUrl('/haoqi-static/work/wasm02.png'),
    gridClass: 'haoqi__workItem--g3',
    aspectRatio: '3840 / 2160',
  },
  {
    tag: 'Coding Project',
    name: 'VectorSymbols',
    year: '2023',
    badge: 'Tools',
    external: true,
    href: 'https://www.figma.com/community/plugin/1255914175202017737/vectorsymbols',
    img: assetUrl('/haoqi-static/work/vs01.png'),
    hoverImg: assetUrl('/haoqi-static/work/vs02.png'),
    gridClass: 'haoqi__workItem--g4',
    aspectRatio: '1440 / 936',
  },
  {
    tag: 'Coding Project',
    name: 'DarkSide',
    year: '2021',
    badge: 'Tools',
    external: true,
    href: 'https://www.figma.com/community/plugin/986289377230504703/darkside',
    img: assetUrl('/haoqi-static/work/ds01.png'),
    hoverImg: assetUrl('/haoqi-static/work/ds02.png'),
    gridClass: 'haoqi__workItem--g5',
    aspectRatio: '1440 / 936',
  },
  {
    name: 'aDrive 阿里云盘',
    year: '2020-2022',
    href: '/adrive',
    img: assetUrl('/haoqi-static/work/ali01.png'),
    hoverImg: assetUrl('/haoqi-static/work/ali02.png'),
    gridClass: 'haoqi__workItem--g6',
    aspectRatio: '1064 / 1496',
  },
  {
    name: 'Shore Icon',
    year: '2022',
    href: '/shore_icon',
    img: assetUrl('/haoqi-static/work/si.png'),
    hoverImg: assetUrl('/haoqi-static/work/si02.png'),
    gridClass: 'haoqi__workItem--g7',
    aspectRatio: '2160 / 2160',
  },
  {
    name: 'Teambition',
    year: '2018-2020',
    href: '/teambition',
    img: assetUrl('/haoqi-static/work/s01.png'),
    hoverImg: assetUrl('/haoqi-static/work/s02.png'),
    gridClass: 'haoqi__workItem--g8',
    aspectRatio: '1200 / 1200',
  },
  {
    name: 'FoF: See Hear Touch',
    year: '2022',
    badge: 'Event',
    external: true,
    href: 'https://friends.figma.com/events/details/figma-shanghai-presents-see-hear-touch/',
    img: assetUrl('/haoqi-static/work/sd01.png'),
    hoverImg: assetUrl('/haoqi-static/work/sd02.png'),
    gridClass: 'haoqi__workItem--g9',
    aspectRatio: '1000 / 1000',
  },
  {
    name: 'FoF: Design System',
    year: '2021',
    badge: 'Event',
    external: true,
    href: 'https://friends.figma.com/events/details/figma-shanghai-presents-design-system/',
    img: assetUrl('/haoqi-static/work/c4.png'),
    gridClass: 'haoqi__workItem--g10',
    aspectRatio: '1000 / 1000',
  },
];
