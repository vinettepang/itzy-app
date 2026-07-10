# Fácil Agencia — 复刻总览

> 生产站：https://facilagencia.com/  
> 目标：在 `apps/h5` 还原个人创意机构网站

## 站点性质

西班牙马德里创意机构 **Fácil** 官网。视觉极简：白底、巨型黑色 **FACIL** 字标、酸橙绿（`#dcff60`）标签、漂浮项目视频卡片、自定义滚动与光标。

CMS 后端为 WordPress（Yoast schema、`wp-content` 媒体），前端为 **Cuchillo** 定制框架打包的单页应用式体验。

## 技术栈（生产 · SOURCE）

| 层 | 技术 |
|---|---|
| CMS | WordPress + Yoast SEO |
| 前端框架 | **Cuchillo**（`facil.cuchillo-black.tools`） |
| 构建产物 | `main.349d1f432ba089f13621.js` + `main.ef126fe469394445cb5b.css` + `preload.js` |
| 动画 | **GSAP** + **ScrollTrigger** |
| 滚动 | **Lenis** + 自定义 `__scroll-manual` 系统 |
| 画布 | 全屏 **Canvas2D** `#Interface__Canvas`（非 WebGL） |
| 分析 | Google Analytics `G-LTTHTJ6JBC` |
| 视频 | Vimeo progressive MP4 + 懒加载 poster |
| 国际化 | `/en/` 英文版 |

## 设计 Token（SOURCE · CSS `:root`）

| Token | 值 |
|---|---|
| `--white` | `#fff` |
| `--black` | `#1a1a1a` |
| `--lime` / `--assertive` | `#dcff60` |
| `--font-facil` | `icomoon`（FACIL 品牌字） |
| `--font-serif` | Times New Roman |
| `--font-mono` | libertinus |
| `--font-size` | `clamp(10px, 1.1111vw, 48px)` |

## 页面路由

| 路径 | `data-page` | 说明 |
|---|---|---|
| `/` | `home` | 首页：巨型字标 + 项目卡片 + 客户 logo 带 + 页脚 |
| `/trabajos/` | `works` | 作品集列表 |
| `/filosofia/` | — | 哲学/理念 |
| `/people/` | — | 团队 |
| `/contact/` | — | 联系 |
| `/projects/{slug}/` | — | 单项目详情（如 `popeyes-nada-mas-nada-menos`） |
| `/en/` | — | 英文首页 |
| 法律页 | — | cookies / privacy / legal / accessibility |

## 全局 DOM 壳

```
body.__scroll-manual.__cursor.palette-primary
├── #testvideo（1×1 静音探测视频，用于自动播放策略）
├── SVG sprite symbols（FACIL 字母 path、logo、cuchillo、kd 徽章）
├── #Header（顶栏 nav：Trabajos / Filosofía / Personas / Contacto）
├── #Sidemenu（移动端/侧栏全屏菜单 + IndexBar 进度条）
├── <article data-page="…">（页面主体）
├── #Footer / #FooterFake
├── Cookie CMP 横幅
└── #Interface__Canvas（全屏 Canvas2D 叠加层，由 JS 注入）
```

## 首页核心模块

1. **顶栏** — `header#Header`，`link-arrow` 悬停动画
2. **引言** — `header-page > h1.description`（衬线正文 + `facil-font` 链接）
3. **巨型 FACIL 字标** — Canvas2D 绘制 + SVG 字母；滚动时绿标签显示联系信息
4. **项目卡片网格** — `.card.card-project.--pos-{1-4}`，`scroll-item` + `scroll-insider` 视差
5. **哲学卡片** — `.card.card-info`（「Creemos en el poder…」）
6. **滚动字幕带** — `FACIL es lo contrario de difícil` 等 `.holder.__word` 分词
7. **客户 Logo 带** — 灰度 logo 横滚
8. **页脚** — 联系信息、社交、法律链接、Kit Digital 徽章

## 交互系统

| 能力 | 实现线索 |
|---|---|
| 平滑滚动 | Lenis + `__scroll-manual` |
| 视差卡片 | `scroll-item` / `scroll-insider`，CSS `--speed-y` / `--speed-x` / `--speed` |
| 页面切换 | 无 Barba；完整 HTML 导航或内部 router（待 bundle 深挖） |
| 自定义光标 | `body.__cursor` + Canvas 层 |
| 侧栏菜单 | `#Sidemenu` + `data-toggle-sidemenu` |
| Index 进度条 | `#IndexBar` + `.progress` |
| 主题 palette | `data-palette="primary|secondary"` → `palette-primary` body class |
| 懒加载 | `data-item-load`、`data-video`、`data-autoplay` |

## 模块拆分（复刻顺序）

| 阶段 | 模块 | 优先级 |
|---|---|---|
| **M0** | 分析文档 + 生产静态资源抓取 | ✅ 进行中 |
| **M1** | 设计系统（CSS 变量、字体、icomoon） | P0 |
| **M2** | 全局壳（Header / Footer / Cookie / 路由） | P0 |
| **M3** | Lenis + 自定义滚动 + ScrollTrigger 视差 | P0 |
| **M4** | Canvas2D `Interface__Canvas`（字标 + 光标 + 绿标签） | P0 |
| **M5** | 首页 HTML 结构 + 项目卡片 + 视频 | P0 |
| **M6** | 子页面（trabajos / filosofia / people / contact） | P1 |
| **M7** | 项目详情页 `/projects/*` | P1 |
| **M8** | Sidemenu + IndexBar | P1 |
| **M9** | `/en/` 国际化 | P2 |
| **M10** | 法律页 + GA/Cookie CMP | P2 |

## h5 集成计划

- 目录：`apps/h5/src/pages/facil/`
- 路由：`/facil`（首页），`/facil/trabajos` 等子路由
- 静态：`apps/h5/public/facil-static/`（字体、sprite、poster 图）
- 依赖：项目已有 `gsap`、`lenis` — 可直接复用

## 证据来源

| 标签 | 路径 |
|---|---|
| SOURCE | `facilagencia-restore/scratch/index.html` |
| SOURCE | `facilagencia-restore/scratch/assets_main.*.js` |
| SOURCE | `facilagencia-restore/scratch/assets_main.*.css` |
| SOURCE | 浏览器截图 `facilagencia-home.png` / `facilagencia-footer.png` |
| SOURCE | 子页 HTML：`trabajos.html`, `filosofia.html`, `people.html`, `contact.html` |

## 待验证 gap

- [ ] Canvas 字标绘制逻辑（bundle class `Go` 及相关类）
- [ ] 页面转场是否为 PJAX / 全页刷新
- [ ] `scroll-item` 精确算法与 Lenis 集成方式
- [ ] 移动端布局断点与 Sidemenu 触发条件
- [ ] 项目详情页模板结构
