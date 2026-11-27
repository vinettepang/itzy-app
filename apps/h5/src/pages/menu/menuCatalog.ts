import { HOME_PROJECTS } from '../facil/data/siteData';
import furniture from '../wakawaka/data/furniture.json';
import products from '../wakawaka/data/products.json';
import stagecrewProjects from '../stagecrew/data/projects.json';
import { helioPages, HELIO_BASE } from '../helioteles/data';
import { NOTH_HOME_WORKS } from '../noth/data/works';

export type MenuLink = { to: string; label: string; note?: string };
export type MenuGroup = { id: string; title: string; links: MenuLink[] };

export type MenuUiFamily = {
  id: string;
  title: string;
  description: string;
  entry: string;
  tag: 'itzy' | 'mirror' | 'lab' | 'meta';
};

/** 独立 Layout / 视觉壳（与 App 内各站点、实验页一一对应） */
export const MENU_UI_FAMILIES: MenuUiFamily[] = [
  {
    id: 'menu',
    title: 'Menu',
    description: '路由索引与统计（本页）',
    entry: '/menu',
    tag: 'meta',
  },
  {
    id: 'itzy-newnew',
    title: 'ITZY · NewNew',
    description: '默认首页 Oh Ira 配色 + Lenis',
    entry: '/',
    tag: 'itzy',
  },
  {
    id: 'itzy-newnew-exhibit',
    title: 'ITZY · NewNew Exhibit',
    description: '展览版首页与票根画廊',
    entry: '/newnew-exhibit',
    tag: 'itzy',
  },
  {
    id: 'itzy-xkm',
    title: 'ITZY · XKM',
    description: '原 XKM 下落首页',
    entry: '/old-home',
    tag: 'itzy',
  },
  {
    id: 'itzy-home',
    title: 'ITZY · Home（旧）',
    description: '早期 Home 页',
    entry: '/home',
    tag: 'itzy',
  },
  {
    id: 'itzy-people',
    title: 'ITZY · People',
    description: '人物名录',
    entry: '/people',
    tag: 'itzy',
  },
  {
    id: 'itzy-appshell',
    title: 'ITZY · App Shell',
    description: 'Gallery / Portfolio 等共用顶栏壳',
    entry: '/gallery',
    tag: 'itzy',
  },
  {
    id: 'itzy-newnew-layout',
    title: 'ITZY · NewNew 内页壳',
    description: 'Poster、Schedules、应援法等',
    entry: '/schedules',
    tag: 'itzy',
  },
  {
    id: 'itzy-labs',
    title: 'ITZY · 单页实验',
    description: 'Songs、Balls、WebGL 等独立样式',
    entry: '/songs',
    tag: 'lab',
  },
  {
    id: 'itzy-ui',
    title: 'ITZY · UI 票根',
    description: 'Mesh 票根 /ui',
    entry: '/ui',
    tag: 'lab',
  },
  {
    id: 'itzy-uicoms',
    title: 'ITZY · UIComs',
    description: '可复用特效组件展示',
    entry: '/uicoms',
    tag: 'lab',
  },
  {
    id: 'itzy-panter-vision',
    title: 'ITZY · Panter Vision',
    description: '玻璃字全屏场景 + Nav 玻璃导航叠层',
    entry: '/panter-vision',
    tag: 'lab',
  },
  {
    id: 'stagecrew',
    title: 'Stagecrew',
    description: 'stagecrew.studio 镜像',
    entry: '/stagecrew',
    tag: 'mirror',
  },
  {
    id: 'yc',
    title: 'YC Ticket',
    description: 'anthnyung 票根机',
    entry: '/yc',
    tag: 'mirror',
  },
  {
    id: 'wakawaka',
    title: 'Waka Waka',
    description: 'wakawaka.world 家具站',
    entry: '/wakawaka',
    tag: 'mirror',
  },
  {
    id: 'helioteles',
    title: 'Hélio Teles',
    description: 'Cargo 长页 + HelioLayout（/variety 同壳）',
    entry: '/helioteles',
    tag: 'mirror',
  },
  {
    id: 'fluoro',
    title: 'FLUORO®',
    description: 'fluoro.london 离线镜像',
    entry: '/fluoro',
    tag: 'mirror',
  },
  {
    id: 'flustudio',
    title: 'Flu Studio',
    description: 'flustudio 镜像 SPA',
    entry: '/flustudio',
    tag: 'mirror',
  },
  {
    id: 'traumclub',
    title: 'Traumclub',
    description: 'WordPress 主题离线包',
    entry: '/traumclub',
    tag: 'mirror',
  },
  {
    id: 'unseen-studio',
    title: 'Unseen Studio',
    description: 'unseen.co WebGL 菜单',
    entry: '/unseen-studio',
    tag: 'mirror',
  },
  {
    id: 'haoqi',
    title: 'Haoqi',
    description: 'haoqi.design 作品集',
    entry: '/haoqi',
    tag: 'mirror',
  },
  {
    id: 'virgil',
    title: 'Virgil',
    description: 'Virgil Abloh 专题站',
    entry: '/virgil',
    tag: 'mirror',
  },
  {
    id: 'facil',
    title: 'Fácil',
    description: 'facil 双语文案站',
    entry: '/facil',
    tag: 'mirror',
  },
  {
    id: 'noth',
    title: 'Noth Studio',
    description: 'noth.studio 还原 + runtime',
    entry: '/noth',
    tag: 'mirror',
  },
  {
    id: 'tfib',
    title: 'The Future in Black',
    description: 'Squarespace 快照 + 组件段落',
    entry: '/thefutureinblack',
    tag: 'mirror',
  },
];

const HAOQI_PROJECTS = [
  { slug: 'reunimos', label: 'Reunimos' },
  { slug: 'inspire_mono', label: 'Inspire Mono' },
  { slug: 'wasm_design_utils', label: 'WASM Design Utils' },
  { slug: 'adrive', label: 'ADrive' },
  { slug: 'shore_icon', label: 'Shore Icon' },
  { slug: 'teambition', label: 'Teambition' },
] as const;

const HELIO_SKIP_PURL = new Set([
  'header',
  'header-mobile',
  'index-desktop',
  'index-mobile',
  'about-mobile',
  'home-1',
]);

function helioMenuPath(purl: string): string {
  if (purl === 'about') return `${HELIO_BASE}/about`;
  if (purl === 'index-variety') return '/variety';
  return `${HELIO_BASE}/${encodeURIComponent(purl)}`;
}

function buildHelioLinks(): MenuLink[] {
  const core: MenuLink[] = [
    { to: '/helioteles', label: 'Home', note: 'helioteles.com' },
    { to: '/helioteles/about', label: 'Information' },
    { to: '/variety', label: 'Variety', note: '综艺列表 · 同 Helio 壳' },
    { to: '/union', label: '/union', note: '短链 → UNION' },
  ];

  const projects = Object.values(helioPages)
    .filter((p) => p.display && p.purl && !HELIO_SKIP_PURL.has(p.purl))
    .filter((p) => !['about', 'index-variety'].includes(p.purl))
    .sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }))
    .map((p) => ({
      to: helioMenuPath(p.purl),
      label: p.title || p.purl,
      note: p.purl,
    }));

  return [...core, ...projects];
}

type StagecrewProjectRow = { slug: string; title: string; sort?: number };

function buildStagecrewProjectLinks(): MenuLink[] {
  const list = Object.values(stagecrewProjects as Record<string, StagecrewProjectRow>).sort(
    (a, b) => (a.sort ?? 0) - (b.sort ?? 0),
  );
  return list.map((p) => ({
    to: `/stagecrew/work/${p.slug}`,
    label: p.title,
    note: 'project',
  }));
}

export function buildMenuGroups(): MenuGroup[] {
  const wakaCategories = furniture.filters.map((f) => ({
    to: `/wakawaka/furniture/${f.slug}`,
    label: f.title,
    note: `${f.count} items`,
  }));

  const wakaProducts = Object.values(products).map((p) => ({
    to: `/wakawaka/${p.slug}`,
    label: p.name,
    note: 'product',
  }));

  const facilProjectsEs = HOME_PROJECTS.map((p) => ({
    to: `/facil/projects/${p.slug}`,
    label: `${p.client} · ${p.slug}`,
  }));

  const facilProjectsEn = HOME_PROJECTS.map((p) => ({
    to: `/facil/en/projects/${p.slug}`,
    label: `${p.client} · ${p.slug}`,
  }));

  const nothCases = NOTH_HOME_WORKS.map((w) => ({
    to: `/noth/works/${w.slug}`,
    label: w.name,
    note: w.slug,
  }));

  return [
    {
      id: 'entry',
      title: '入口 / Core',
      links: [
        { to: '/menu', label: 'Menu（本页）' },
        { to: '/', label: 'NewNew', note: '默认首页' },
        { to: '/newnew-exhibit', label: 'NewNew Exhibit' },
        { to: '/old-home', label: 'Old Home', note: 'XKM' },
        { to: '/xkm', label: 'XKM（别名）' },
        { to: '/home', label: 'Home（旧）' },
        { to: '/new_home', label: 'New Home', note: 'XKM + haoqi 下落' },
        { to: '/people', label: 'People' },
        { to: '/ui', label: 'UI', note: 'Mesh 票根' },
        { to: '/uicoms', label: 'UIComs', note: '特效组件库' },
        { to: '/panter-vision', label: 'Panter Vision', note: '玻璃字全屏 · Nav 叠层' },
        { to: '/pv/cheer/tunnel-vision', label: 'PV · 应援法', note: 'panter-vision 副本' },
        { to: '/pv/schedules', label: 'PV · 行程' },
        { to: '/pv/dolls', label: 'PV · 娃娃图鉴' },
        { to: '/pv/variety', label: 'PV · 综艺合集' },
        { to: '/pv/albums', label: 'PV · 专辑' },
        { to: '/pv/jar', label: 'PV · 金色记忆球' },
        { to: '/cube', label: 'Cube', note: '魔方旋转 + 参考视频' },
        { to: '/folder', label: 'Folder', note: '3D 文件夹点开 + 参考视频' },
        { to: '/jar', label: 'Mood Jar', note: '纸条变发光球放进罐子' },
        { to: '/albums', label: 'Albums', note: '专辑弧形转盘 · 滚轮联动曲目' },
        { to: '/nav', label: 'Nav', note: '圆角 bento 导航' },
        { to: '/misplaced', label: 'Misplaced Beauty', note: '透明袋旋转视频 · 拖拽转动' },
        { to: '/experiment', label: 'Experiment Shop', note: '液态铬 S · 蓝绿柔光商品页' },
        { to: '/capslock', label: 'Capslock Drop', note: '倒计时 · 专辑封面 3D 环变形 + 原视频' },
        { to: '/works', label: 'Selected Works', note: 'Flat / Tilt / Ring / Gallery 漂浮专辑环 + 鼠标推开' },
        { to: '/unveil', label: 'Unveil Studio', note: '斜向 3D 专辑堆叠 · 放射模糊 / 碎裂 / 溶解 / 半调转场' },
      ],
    },
    {
      id: 'app-shell',
      title: 'ITZY · App Shell',
      links: [
        { to: '/gallery', label: 'Gallery' },
        { to: '/gallery/local-demo-album', label: 'Gallery Detail', note: '示例相册' },
        { to: '/lab-style', label: 'Lab Style' },
        { to: '/portfolio', label: 'Portfolio' },
      ],
    },
    {
      id: 'newnew-shell',
      title: 'ITZY · NewNew 内页',
      links: [
        { to: '/schedules', label: 'Schedules' },
        { to: '/poster', label: 'Poster' },
        { to: '/poster/preview', label: 'Poster Preview' },
        { to: '/game', label: 'Game' },
        { to: '/setlist', label: '三巡歌单', note: 'TUNNEL VISION' },
        { to: '/cheer/tunnel-vision', label: 'Tunnel Vision 应援法' },
        { to: '/cheer/gold', label: 'GOLD 应援法' },
        { to: '/cheer/wannabe', label: 'WANNABE 应援法' },
        { to: '/unseen', label: 'Unseen', note: '本地玩偶页' },
        { to: '/dolls', label: 'Dolls', note: '娃娃图鉴' },
      ],
    },
    {
      id: 'experiments',
      title: 'Experiments / Labs',
      links: [
        { to: '/songs', label: 'Songs' },
        { to: '/balls', label: 'Balls' },
        { to: '/labs/webgl-refraction', label: 'WebGL Refraction' },
      ],
    },
    {
      id: 'stagecrew',
      title: 'Stagecrew',
      links: [
        { to: '/stagecrew', label: 'Work', note: 'stagecrew.studio' },
        { to: '/stagecrew/info', label: 'Info' },
        { to: '/stagecrew/backstage', label: 'Backstage' },
        ...buildStagecrewProjectLinks(),
      ],
    },
    {
      id: 'anthnyung-yc',
      title: 'YC Ticket',
      links: [
        { to: '/yc', label: 'Startup School 2026', note: 'anthnyung.com/yc' },
        { to: '/yc/detail', label: 'Ticket detail', note: '最终票根' },
      ],
    },
    {
      id: 'wakawaka',
      title: 'Waka Waka',
      links: [
        { to: '/wakawaka', label: 'Home', note: 'wakawaka.world' },
        { to: '/wakawaka/studio', label: 'Studio' },
        { to: '/wakawaka/catalogue', label: 'Catalogue / Index' },
        { to: '/wakawaka/furniture', label: 'Furniture' },
        ...wakaCategories,
      ],
    },
    {
      id: 'wakawaka-products',
      title: 'Waka Waka · Products',
      links: wakaProducts,
    },
    {
      id: 'helioteles',
      title: 'Hélio Teles',
      links: buildHelioLinks(),
    },
    {
      id: 'fluoro',
      title: 'FLUORO®',
      links: [{ to: '/fluoro', label: 'Index', note: 'fluoro.london/index' }],
    },
    {
      id: 'flustudio',
      title: 'Flu Studio',
      links: [{ to: '/flustudio', label: 'Index', note: 'flustudio 镜像' }],
    },
    {
      id: 'traumclub',
      title: 'Traumclub',
      links: [{ to: '/traumclub', label: 'Index', note: 'traumclub 离线' }],
    },
    {
      id: 'unseen-studio',
      title: 'Unseen Studio',
      links: [
        { to: '/unseen-studio', label: 'Index / Home', note: 'unseen.co' },
        { to: '/unseen-studio/projects', label: 'Projects' },
        { to: '/unseen-studio/contact', label: 'Contact' },
        { to: '/unseen-studio/world', label: 'World' },
      ],
    },
    {
      id: 'noth',
      title: 'Noth Studio',
      links: [
        { to: '/noth', label: 'Home', note: 'noth.studio' },
        { to: '/noth/works', label: 'Works' },
        { to: '/noth/studio', label: 'Studio', note: 'placeholder' },
        { to: '/noth/contact', label: 'Contact', note: 'placeholder' },
        ...nothCases,
      ],
    },
    {
      id: 'thefutureinblack',
      title: 'The Future in Black',
      links: [
        { to: '/thefutureinblack', label: 'Home', note: 'thefutureinblack.com' },
        { to: '/thefutureinblack/forms', label: 'Forms' },
      ],
    },
    {
      id: 'haoqi',
      title: 'Haoqi',
      links: [
        { to: '/haoqi', label: 'Haoqi Home' },
        ...HAOQI_PROJECTS.map((p) => ({
          to: `/haoqi/${p.slug}`,
          label: p.label,
          note: `/haoqi/${p.slug}`,
        })),
        ...HAOQI_PROJECTS.map((p) => ({
          to: `/${p.slug}`,
          label: `${p.label}（短链）`,
          note: `/${p.slug}`,
        })),
      ],
    },
    {
      id: 'virgil',
      title: 'Virgil',
      links: [
        { to: '/virgil', label: 'Virgil' },
        { to: '/virgil/privacy-policy', label: 'Privacy Policy' },
        { to: '/virgil/terms', label: 'Terms' },
      ],
    },
    {
      id: 'facil-es',
      title: 'Fácil · ES',
      links: [
        { to: '/facil', label: 'Home' },
        { to: '/facil/trabajos', label: 'Trabajos' },
        { to: '/facil/filosofia', label: 'Filosofía' },
        { to: '/facil/people', label: 'People' },
        { to: '/facil/contact', label: 'Contact' },
        { to: '/facil/politica-de-privacidad', label: 'Política de privacidad' },
        { to: '/facil/aviso-legal', label: 'Aviso legal' },
        { to: '/facil/politica-de-cookies', label: 'Política de cookies' },
        { to: '/facil/declaracion-de-accesibilidad', label: 'Accesibilidad' },
        ...facilProjectsEs,
      ],
    },
    {
      id: 'facil-en',
      title: 'Fácil · EN',
      links: [
        { to: '/facil/en', label: 'Home' },
        { to: '/facil/en/works', label: 'Works' },
        { to: '/facil/en/philosophy', label: 'Philosophy' },
        { to: '/facil/en/people', label: 'People' },
        { to: '/facil/en/contact', label: 'Contact' },
        { to: '/facil/en/privacy-policy', label: 'Privacy Policy' },
        { to: '/facil/en/legal-notice', label: 'Legal Notice' },
        { to: '/facil/en/cookie-policy', label: 'Cookie Policy' },
        { to: '/facil/en/accessibility-statement', label: 'Accessibility' },
        ...facilProjectsEn,
      ],
    },
  ];
}

export type MenuInventory = {
  groupCount: number;
  linkCount: number;
  uniquePathCount: number;
  uiFamilyCount: number;
  uiByTag: Record<MenuUiFamily['tag'], number>;
};

export function getMenuInventory(groups: MenuGroup[]): MenuInventory {
  const links = groups.flatMap((g) => g.links);
  const uniquePathCount = new Set(links.map((l) => l.to)).size;
  const uiByTag = MENU_UI_FAMILIES.reduce(
    (acc, f) => {
      acc[f.tag] = (acc[f.tag] ?? 0) + 1;
      return acc;
    },
    {} as Record<MenuUiFamily['tag'], number>,
  );

  return {
    groupCount: groups.length,
    linkCount: links.length,
    uniquePathCount,
    uiFamilyCount: MENU_UI_FAMILIES.length,
    uiByTag,
  };
}
