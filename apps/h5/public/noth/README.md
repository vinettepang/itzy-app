# Noth.in 本地静态镜像

站点原址：https://www.noth.in/  
在 H5 应用中通过 `/noth` 跳转到 `noth/index.html`（非 iframe）。

## 更新镜像

```bash
# 多页抓取（Playwright，需已安装 Chromium）+ 资源离线化
pnpm run mirror:noth:full

# 仅根据现有 public/noth/**/*.html 重新下载资源并收尾
pnpm run mirror:noth:offline
```

## 说明

- 这是 **Webflow 静态快照**，不是 Designer 工程源码；交互、表单、聊天、支付等依赖原站 API 的功能离线不可用。
- 追踪脚本、GTM、Metricool、Brevo、Cloudflare challenge 等已在离线脚本中剔除。
- 站内路径 `href="/works"` 等会改写为相对路径，便于在 `/noth/` 下多页浏览。
