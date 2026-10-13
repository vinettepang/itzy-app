# Traum Club 离线镜像

当 `traumclub.com` 服务器不可用时，用本目录在本地或静态托管上恢复站点展示。

## 本地预览

- `http://localhost:3002/traumclub` → 跳转到 `traumclub/index.html`
- 或直接打开 `traumclub/index.html`

## 更新 / 全量拉取

在 `apps/h5` 下（需能访问线上 `traumclub.com`）：

```bash
# 仅首页 + 首页引用的 CSS/JS/图片/字体
node scripts/mirror-traumclub-offline.mjs --pages=home

# 根据 wp-sitemap 拉取最多约 40 个页面（较慢）
node scripts/mirror-traumclub-offline.mjs
```

或使用：

```bash
pnpm run mirror:traumclub:offline
```

资源保存在 `assets/`（保留原 WordPress 路径结构）。`offline-manifest.json` 记录 URL 映射。

## 限制

- WordPress **后台、表单提交、admin-ajax** 离线不可用。
- 外链（Paylogic 购票等）仍会指向第三方；如需完全断网浏览可再改 HTML 内链。
- 完整 WordPress 源码与数据库不在此镜像内；这是**静态快照**，用于展示与应急。
