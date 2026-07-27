import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './MenuPage.css';

type MenuLink = { to: string; label: string; note?: string };

type MenuGroup = { title: string; links: MenuLink[] };

const MENU_GROUPS: MenuGroup[] = [
  {
    title: '入口',
    links: [
      { to: '/menu', label: 'Menu（本页）', note: '/menu' },
      { to: '/', label: 'XKM', note: '/' },
      { to: '/new_home', label: 'New Home', note: 'XKM + haoqi 下落' },
      { to: '/home', label: 'Home', note: '/home' },
      { to: '/xkm', label: 'XKM (别名)', note: '/xkm' },
    ],
  },
  {
    title: '独立页面',
    links: [
      { to: '/songs', label: 'Songs' },
      { to: '/unseen', label: 'Unseen（本地玩偶页）' },
      { to: '/balls', label: 'Balls' },
      { to: '/labs/webgl-refraction', label: 'WebGL Refraction（Labs）' },
    ],
  },
  {
    title: 'Unseen Studio（unseen.co）',
    links: [
      { to: '/unseen-studio', label: 'Index / Home' },
      { to: '/unseen-studio/projects', label: 'Projects' },
      { to: '/unseen-studio/contact', label: 'Contact' },
      { to: '/unseen-studio/world', label: 'World' },
    ],
  },
  {
    title: 'Haoqi',
    links: [
      { to: '/haoqi', label: 'Haoqi Home' },
      { to: '/haoqi/reunimos', label: 'reunimos' },
      { to: '/haoqi/inspire_mono', label: 'inspire_mono' },
      { to: '/haoqi/wasm_design_utils', label: 'wasm_design_utils' },
      { to: '/haoqi/adrive', label: 'adrive' },
      { to: '/haoqi/shore_icon', label: 'shore_icon' },
      { to: '/haoqi/teambition', label: 'teambition' },
      { to: '/reunimos', label: 'reunimos (短链)' },
      { to: '/inspire_mono', label: 'inspire_mono (短链)' },
      { to: '/wasm_design_utils', label: 'wasm_design_utils (短链)' },
      { to: '/adrive', label: 'adrive (短链)' },
      { to: '/shore_icon', label: 'shore_icon (短链)' },
      { to: '/teambition', label: 'teambition (短链)' },
    ],
  },
  {
    title: 'Virgil',
    links: [
      { to: '/virgil', label: 'Virgil' },
      { to: '/virgil/privacy-policy', label: 'Privacy Policy' },
      { to: '/virgil/terms', label: 'Terms' },
    ],
  },
  {
    title: 'Fácil (ES)',
    links: [
      { to: '/facil', label: 'Home' },
      { to: '/facil/trabajos', label: 'Trabajos' },
      { to: '/facil/filosofia', label: 'Filosofía' },
      { to: '/facil/people', label: 'People' },
      { to: '/facil/contact', label: 'Contact' },
      { to: '/facil/projects/popeyes-nada-mas-nada-menos', label: 'Project · Popeyes' },
      { to: '/facil/politica-de-privacidad', label: 'Política de privacidad' },
      { to: '/facil/aviso-legal', label: 'Aviso legal' },
      { to: '/facil/politica-de-cookies', label: 'Política de cookies' },
      { to: '/facil/declaracion-de-accesibilidad', label: 'Accesibilidad' },
    ],
  },
  {
    title: 'Fácil (EN)',
    links: [
      { to: '/facil/en', label: 'Home' },
      { to: '/facil/en/works', label: 'Works' },
      { to: '/facil/en/philosophy', label: 'Philosophy' },
      { to: '/facil/en/people', label: 'People' },
      { to: '/facil/en/contact', label: 'Contact' },
      { to: '/facil/en/projects/popeyes-nada-mas-nada-menos', label: 'Project · Popeyes' },
      { to: '/facil/en/privacy-policy', label: 'Privacy Policy' },
      { to: '/facil/en/legal-notice', label: 'Legal Notice' },
      { to: '/facil/en/cookie-policy', label: 'Cookie Policy' },
      { to: '/facil/en/accessibility-statement', label: 'Accessibility' },
    ],
  },
  {
    title: 'App Layout',
    links: [
      { to: '/gallery', label: 'Gallery' },
      { to: '/schedules', label: 'Schedules' },
      { to: '/lab-style', label: 'Lab Style' },
      { to: '/poster', label: 'Poster' },
      { to: '/poster/preview', label: 'Poster Preview' },
      { to: '/game', label: 'Game' },
      { to: '/portfolio', label: 'Portfolio' },
    ],
  },
];

export default function MenuPage() {
  // Other pages (Facil/XKM/Songs/…) may leave body/html scroll-locked.
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
        <p className="menu-page__desc">当前应用全部路由入口，点击即可跳转。</p>
      </header>

      <nav className="menu-page__nav" aria-label="Site routes">
        {MENU_GROUPS.map((group) => (
          <section key={group.title} className="menu-page__group">
            <h2 className="menu-page__group-title">{group.title}</h2>
            <ul className="menu-page__list">
              {group.links.map((link) => (
                <li key={link.to}>
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
