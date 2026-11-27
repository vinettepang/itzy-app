# felixpeault 静态资源

**页面已迁移为 React**：`src/pages/felixpeault/`（路由 `/felixpeault/*`）。  
本目录保留 **字体**、`_app/immutable/assets/*.css`（React 版式与动效类名）等；`_archive-svelte-index.html` 为旧 Svelte 入口备份。Vite 需将 `/felixpeault/_app/` 作为静态资源直出（见 `vite.config.ts`）。

从线上 **已构建** 的 SvelteKit 站点拉取的静态文件（非 `.svelte` 源码），可用于导出 `content.json`。

更新镜像：

```bash
node scripts/mirror-felixpeault.mjs
node scripts/mirror-felix-sw-assets.mjs
node scripts/fetch-felix-data-json.mjs
```

若 `curl` 拉到的 `*/__data.json` 是 Cloudflare 页面，开发时 Vite 会自动从线站补拉；也可在浏览器能打开线站时用 `scripts/fetch-felix-data-json.mjs`（需 Playwright）或 `scripts/decode-felix-route-data.mjs` 写入缓存。

**首页 `index.html`**：命令行拉取常被 Cloudflare 返回挑战页。请在浏览器能打开 https://felixpeault.com/ 后，用开发者工具保存 HTML，或把 CDP 导出的 JSON 交给：

```bash
node scripts/patch-felix-html.mjs path/to/capture.json public/felixpeault/index.html
```

本地访问：`http://localhost:3002/felixpeault/`

> 这是 **SvelteKit 线上构建产物**（JS/CSS + 内嵌数据），不是 `.svelte` 源码。要恢复可编辑源码，仍需从 Git / 部署平台 / 本机备份找回。

照片仍从 Sanity CDN 加载，需联网。若进入新页面后缺 chunk，在浏览器打开对应线上路由后把新出现的 `/_app/immutable/*` 路径加入 `scripts/mirror-felixpeault.mjs` 的 `SEED_PATHS` 再执行脚本。
