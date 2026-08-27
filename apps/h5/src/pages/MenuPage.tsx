import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { HOME_PROJECTS } from './facil/data/siteData';
import furniture from './wakawaka/data/furniture.json';
import products from './wakawaka/data/products.json';
import './MenuPage.css';

type MenuLink = { to: string; label: string; note?: string };
type MenuGroup = { id: string; title: string; links: MenuLink[] };

const HAOQI_PROJECTS = [
  { slug: 'reunimos', label: 'Reunimos' },
  { slug: 'inspire_mono', label: 'Inspire Mono' },
  { slug: 'wasm_design_utils', label: 'WASM Design Utils' },
  { slug: 'adrive', label: 'ADrive' },
  { slug: 'shore_icon', label: 'Shore Icon' },
  { slug: 'teambition', label: 'Teambition' },
] as const;

function buildMenuGroups(): MenuGroup[] {
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

  return [
    {
      id: 'entry',
      title: '入口 / Core',
      links: [
        { to: '/menu', label: 'Menu（本页）' },
        { to: '/', label: 'XKM', note: '默认首页' },
        { to: '/xkm', label: 'XKM（别名）' },
        { to: '/home', label: 'Home' },
        { to: '/new_home', label: 'New Home', note: 'XKM + haoqi 下落' },
        { to: '/newnew', label: 'NewNew', note: 'Oh Ira 配色版' },
      ],
    },
    {
      id: 'app-shell',
      title: 'ITZY · App Shell',
      links: [
        { to: '/gallery', label: 'Gallery' },
        { to: '/gallery/local-demo-album', label: 'Gallery Detail', note: '示例相册' },
        { to: '/schedules', label: 'Schedules' },
        { to: '/poster', label: 'Poster' },
        { to: '/poster/preview', label: 'Poster Preview' },
        { to: '/lab-style', label: 'Lab Style' },
        { to: '/portfolio', label: 'Portfolio' },
        { to: '/game', label: 'Game' },
      ],
    },
    {
      id: 'experiments',
      title: 'Experiments / Labs',
      links: [
        { to: '/songs', label: 'Songs' },
        { to: '/setlist', label: '三巡歌单', note: 'TUNNEL VISION' },
        { to: '/cheer/tunnel-vision', label: 'Tunnel Vision 应援法' },
        { to: '/cheer/gold', label: 'GOLD 应援法' },
        { to: '/cheer/wannabe', label: 'WANNABE 应援法' },
        { to: '/unseen', label: 'Unseen', note: '本地玩偶页' },
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
        { to: '/stagecrew/work/aura', label: 'Project · AURA' },
        { to: '/stagecrew/work/hall-gad-architects', label: 'Project · Hall Gad' },
        { to: '/stagecrew/work/the-hall', label: 'Project · The Hall' },
        { to: '/stagecrew/work/innerstate', label: 'Project · INNERSTATE' },
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

export default function MenuPage() {
  const groups = useMemo(() => buildMenuGroups(), []);
  const totalRoutes = useMemo(
    () => groups.reduce((n, g) => n + g.links.length, 0),
    [groups],
  );

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    html.classList.remove(
      'lenis',
      'lenis-smooth',
      'lenis-stopped',
      'facil-scroll-active',
      'virgil-page',
      'virgil-inverted',
    );
    body.classList.remove(
      '__noScroll',
      'facil-body',
      '__scroll-manual',
      '__cursor',
      'palette-primary',
    );

    html.style.overflow = '';
    body.style.overflow = '';
    body.style.position = '';
    body.style.height = '';
    body.style.width = '';
    body.style.top = '';
  }, []);

  return (
    <div className="menu-page">
      <header className="menu-page__header">
        <p className="menu-page__eyebrow">itzy-app / h5</p>
        <h1 className="menu-page__title">Menu</h1>
        <p className="menu-page__desc">
          全部路由入口，按站点 / 模块分组。共 {groups.length} 组 · {totalRoutes} 条。
        </p>

        <nav className="menu-page__toc" aria-label="Groups">
          {groups.map((group) => (
            <a key={group.id} className="menu-page__toc-link" href={`#menu-${group.id}`}>
              {group.title}
              <span className="menu-page__toc-count">{group.links.length}</span>
            </a>
          ))}
        </nav>
      </header>

      <nav className="menu-page__nav" aria-label="Site routes">
        {groups.map((group) => (
          <section key={group.id} id={`menu-${group.id}`} className="menu-page__group">
            <h2 className="menu-page__group-title">
              {group.title}
              <span className="menu-page__group-count">{group.links.length}</span>
            </h2>
            <ul className="menu-page__list">
              {group.links.map((link) => (
                <li key={`${group.id}:${link.to}`}>
                  <Link to={link.to} className="menu-page__link">
                    <span className="menu-page__link-label">{link.label}</span>
                    <span className="menu-page__link-path">{link.note ?? link.to}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </nav>
    </div>
  );
}
