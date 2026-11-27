import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  MENU_UI_FAMILIES,
  buildMenuGroups,
  getMenuInventory,
} from './menu/menuCatalog';
import './MenuPage.css';

const UI_TAG_LABEL: Record<string, string> = {
  meta: '索引',
  itzy: 'ITZY',
  lab: '实验',
  mirror: '站点镜像',
};

export default function MenuPage() {
  const groups = useMemo(() => buildMenuGroups(), []);
  const inventory = useMemo(() => getMenuInventory(groups), [groups]);

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
          h5 全部可点入口与 UI 体系一览。动态路由（如{' '}
          <code className="menu-page__inline-code">/cheer/:slug</code>、
          <code className="menu-page__inline-code">/gallery/:id</code>）在下列样本链接中体现。
        </p>

        <dl className="menu-page__stats" aria-label="Inventory">
          <div className="menu-page__stat">
            <dt>页面入口</dt>
            <dd>{inventory.linkCount}</dd>
            <dd className="menu-page__stat-note">{inventory.uniquePathCount} 条唯一路径</dd>
          </div>
          <div className="menu-page__stat">
            <dt>UI 体系</dt>
            <dd>{inventory.uiFamilyCount}</dd>
            <dd className="menu-page__stat-note">
              ITZY {inventory.uiByTag.itzy} · 镜像 {inventory.uiByTag.mirror} · 实验{' '}
              {inventory.uiByTag.lab}
            </dd>
          </div>
          <div className="menu-page__stat">
            <dt>路由分组</dt>
            <dd>{inventory.groupCount}</dd>
            <dd className="menu-page__stat-note">按站点 / 模块</dd>
          </div>
        </dl>

        <section className="menu-page__ui" aria-labelledby="menu-ui-heading">
          <h2 id="menu-ui-heading" className="menu-page__ui-heading">
            UI 体系
            <span className="menu-page__group-count">{MENU_UI_FAMILIES.length}</span>
          </h2>
          <ul className="menu-page__ui-grid">
            {MENU_UI_FAMILIES.map((family) => (
              <li key={family.id}>
                <Link to={family.entry} className="menu-page__ui-card">
                  <span className="menu-page__ui-card-tag">{UI_TAG_LABEL[family.tag]}</span>
                  <span className="menu-page__ui-card-title">{family.title}</span>
                  <span className="menu-page__ui-card-desc">{family.description}</span>
                  <span className="menu-page__ui-card-path">{family.entry}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

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
