# Virgil Abloh Archive — 复刻总览

> 生产站：https://www.virgilabloh.com/  
> 目标：在 `apps/h5` 中还原 VAA Announcement 落地页及法律页

## 技术栈（生产）

| 层 | 技术 |
|---|---|
| 框架 | Next.js App Router |
| 样式 | styled-components 6.x |
| 3D | Three.js r183（证书 `certificate-canvas-container`） |
| 表单 | Klaviyo + Cloudflare Turnstile |
| 分析 | GTM / Segment / Sentry |

## 设计令牌

| 令牌 | 值 |
|---|---|
| 主背景 | `#1C4A96` |
| 主文字 | `#FFFFFF` |
| 反色模式 | `html.site-inverted { filter: invert(1) }` |
| 主题色 meta | `#1C4A96` |
| Nike 子站 | `data-nike-theme` → 白底 `#FFFFFF` / 字 `#1E1E1E` |
| 字体 | `Business System`（展示）、`Simon Mono`（元数据/正文） |
| 响应式 | `--vw` 缩放、`--initial-vh` 移动端高度 |
| 断点 | `700px` / `720px` |

## 页面路由

| 路径 | 说明 |
|---|---|
| `/` | VAA Announcement 主页（滚动 + 证书 3D + 注册） |
| `/privacy-policy` | 隐私政策 |
| `/terms` | 条款 |
| `/usmnt` | Nike X2 子项目（白底主题） |
| `/aj1` | AJ1 子项目 |

## 模块拆分（复刻顺序）

1. **布局壳** — 固定 Header、胶片噪点、背景 VAA 水印 SVG
2. **排版** — ANNOUNCEMENT 大标题动画、逐字显现正文、Mission 区
3. **证书 WebGL** — Three.js 卷曲纸张 + 全息 foil shader
4. **注册区** — Join the archive 表单 UI
5. **法律页** — privacy / terms 同壳滚动文
6. **子站** — usmnt / aj1（后续）

## 静态资源

- `/fonts/AA00BusinessSystem-Regular.otf`
- `/fonts/SimonMono-Regular.otf`
- `/images/aj1-article/noise.png`（胶片颗粒 overlay）
- 证书贴图（待从 network / bundle 提取）

## h5 集成方案

- 目录：`apps/h5/src/pages/virgil/`
- 静态：`apps/h5/public/virgil-static/`
- 路由：`/virgil`（standalone，无 AppLayout 壳）
- 法律页：`/virgil/privacy-policy`、`/virgil/terms`
- 外链保持生产 URL：`/usmnt` → 可先做占位或外链生产
