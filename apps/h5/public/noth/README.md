# Noth.in — React 实现（本地资源）

原站：https://www.noth.in/

- **入口**：H5 SPA `/noth`（React Router，不再跳转静态 `index.html`）
- **代码**：`src/pages/noth/`
- **样式**：Webflow 导出 CSS 在 `assets/`（仅作样式表，非整页镜像）
- **归档 HTML**：`_archive-html/`（对照 DOM / 文案，可跑 `node scripts/noth-generate-pages.mjs`）

## 字体（本地）

将以下文件放入 `public/noth/fonts/`（CDN 403 时需从设计稿或线上另存）：

- `PPNeueMontreal-Book.woff2`
- `PPNeueMontreal-Medium.woff2`

IBM Plex Mono 已由 `pnpm run setup:noth` 下载。

## 资源同步

```bash
pnpm run setup:noth
```

按 `offline-manifest.json` 补齐 `assets/` 中的图片与视频。

## Case 归档（Works 子页）

```bash
# Playwright 直抓（若 Cloudflare 拦截，设 NOTH_FETCH_HEADED=1 或用手动导入）
pnpm run fetch:noth:cases
# NOTH_FETCH_HEADED=1 pnpm run fetch:noth:cases aurbse

# 浏览器另存为后：
# pnpm run import:noth:case aurbse C:\path\to\aurbse.html

# 或先全站镜像再同步归档
pnpm run mirror:noth:full
pnpm run sync:noth:archive

pnpm run generate:noth
```

生成 `NOTH_CASE_PAGES` 后 `/noth/works/:slug` 使用归档 DOM。

## 动效 / DOM

- 首页与 Works 的 DOM 来自 `_archive-html`（`pnpm run generate:noth` → `src/pages/noth/generated/*.ts`）。
- 原站逻辑包：`8cae500c5405-main.spa.js`（legacy 整包）、`8cae500c5405-main.hero.mjs`（React 模式仅 hero WebGL + gsap，由 `pnpm run generate:noth` 生成）。
- **动效运行时**：默认 `src/pages/noth/runtime/`（Lenis、loader、WebGL hero、菜单、works、glitch 等）。仅调试 legacy 时在 `.env.local` 设 `VITE_NOTH_LEGACY_MAIN=true` 加载 `main.spa.js`。
- **路由**：`/noth`、`/noth/works`、`/noth/works/:slug`（将 case 存为 `_archive-html/works/<slug>/index.html` 后 `pnpm run generate:noth` 自动生成 `NOTH_CASE_PAGES`）。
- **首页作品链**：由 `works/index.html` 的 slug 索引写入 `/noth/works/<slug>` + `data-transition="flip"`。
- 路线图：`src/pages/noth/runtime/MIGRATION.md`。
