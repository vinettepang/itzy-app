# Unseen Studio — 复刻总览

> 生产站：https://unseen.co/  
> 目标：在 `apps/h5` 还原 Unseen Studio® 官网（Brand / Digital / Motion）  
> 分析日期：2026-07-13  
> 证据标签：`SOURCE` = 生产可验证；`PARTIAL` = 部分确认；`GUESS` = 推断

## 0. 与仓库现状的关系（重要）

| 现有路径 | 性质 | 与 unseen.co 关系 |
|---|---|---|
| `apps/h5` 路由 `/unseen`（`UnseenPage` + dolls） | 本地「玩偶世界」交互页 | **不是** 生产站还原；勿覆盖 |
| `apps/h5` 路由 `/labs/webgl-refraction` | Labs Experiment 002 | 生产对应 `https://unseen.co/labs/webgl-refraction/`，已有独立还原 |
| **本任务目标路由（建议）** | `/unseen-studio`（或 `/unseen-co`） | 主站 Index / Projects / Contact / World |

## 1. 站点性质（SOURCE）

英国 Bristol / London 创意工作室 **Unseen Studio®** 官网。首页为深色 loader → 进入后全屏 **WebGL 三维场景**（客厅/道具岛屿）+ DOM UI 叠层（导航、菜单、声效、2025 Wrapped 入口）。

WordPress 页面类名示例：`home page page-id-7 page-template-home-contact`。

## 2. 技术栈（SOURCE · 网络 + DOM）

| 层 | 技术 | 证据 |
|---|---|---|
| CMS | WordPress | `wp-content/themes/unseen/...`，`body.page-id-*` |
| 主题 | 定制 theme `unseen` | `/wp-content/themes/unseen/` |
| 打包 | Webpack chunk `unseen` | `manifest.js` + `vendor.js` (~1.1MB) + `theme.js` (~0.4MB) |
| 3D | **Three.js**（全局 `window` 可探测） | `canvas#gl` WebGL；GLB + Draco + KTX2/Basis |
| 纹理压缩 | **Basis transcoder** + **KTX2** | `resources/assets/basis/*`，大量 `*.ktx2` |
| 网格压缩 | **Draco** | `resources/assets/draco/*` |
| 滚动 | **ASScroll**（`asscroll` DOM） | `theme.js` 命中 54；HTML `asscroll-container` |
| 路由转场 | **Highway** | `theme.js` 命中 52；`data-router-wrapper` / `data-router-view` |
| DOM↔WebGL | **Dom2Webgl** | `theme.js` 命中 28 |
| 音频 | **Howler** (`Howl`) | `theme.js` 命中 7 |
| 资源调度 | `AssetLoader` / `TaskScheduler` | `theme.js` |
| 动画 | **GSAP**（少量） | `theme.js` 命中 3 |
| 字体 | Neue Montreal、Saol Display（Light / LightItalic） | `@font-face` + preload woff2 |
| 音频 | `audio.webm` + Enter with/without audio | network + loader 按钮 |
| 分析 | GA `G-SHZRDC7G64` | gtag 请求 |

CSS 主文件：`/wp-content/themes/unseen/public/css/style.css?id=63f2ece398b534f2523b0748e42ffee1`

## 3. 路由地图（SOURCE）

| 路径 | 页面 | 备注 |
|---|---|---|
| `/` | Index / Home | `page-template-home-contact`；WebGL home scene |
| `/projects/` | Projects | 作品索引（需进入后细查） |
| `/contact/` | Contact | 同模板族；`page-id-398` |
| `/world/` | World | `page-template-world`；`body.dark` |
| `/labs/webgl-refraction/` | Labs | 已在 h5 单独还原 |
| `https://2025.unseen.co/` | 2025 Wrapped | 外链子站，本任务可后置 |

主导航文案：Index / Projects / Contact；汉堡菜单额外含 **World**（04）。

联系与社交（SOURCE · DOM）：

- `projects@unseen.co`、`hello@unseen.co`
- Tel `(+44) 0117 922 6892`
- Twitter / Instagram / LinkedIn / Dribbble / Behance

## 4. 首页视觉与交互（SOURCE · 截图 + DOM）

### 4.1 Loader 门禁

- 背景 `#212121`，粉色进度块 `#efded9`
- SVG 双眼动画（`.loader__eyes` / `.js-eyes*`）
- 标题 `Unseen Studio®` + 多行 tagline
- 双入口：`Enter`（有音频） / `Enter without audio`
- 另有 `.naked-loader`（U N S E E N … 字母块）用于后续过渡

### 4.2 进入后壳层

```
body
├── .loader / .naked-loader
├── header（logo + Index/Projects/Contact + menu toggle）
├── .menu（01–04 全屏菜单 + 联系/社交）
├── canvas#gl（全屏 WebGL）
├── sound toggle / 2025 Wrapped pill
└── main（页面文案层）
```

### 4.3 Home WebGL 资源（SOURCE · 网络）

主题目录 `resources/assets/`：

**模型（GLB）**

- `models/home/room-1.glb`, `room-2.glb`
- `chair.glb`, `pillows.glb`, `rocks.glb`, `table-3.glb`
- `land-group.glb`, `grass-simple.glb`
- `objectsData.glb`
- `models/project-menu/butterfly.glb`, `arch-dc.glb`, `floor-dc.glb`

**贴图（KTX2）**

- `images/home/room-1.ktx2` … `table.ktx2`
- `pearl-matcap.ktx2`, `particles.ktx2`, `skymap-tile.ktx2`, `ao.ktx2`
- `images/project-menu/arch.ktx2`
- 以及 `wp-content/uploads/.../*.ktx2` 项目卡图

**音频**

- `resources/assets/audio/audio.webm`

## 5. 复杂度评估

本站核心是 **完整 Three.js 产品级场景**（多 GLB、KTX2、自定义材质/粒子、Dom2Webgl、音频、页面转场），远超普通 DOM 复刻。  
Labs 折射页已证明「shader extractor → baseline → projectize」路径可行；主站应采用相同纪律：

1. 先锁 `canvas#gl` 表面组（web-shader-extractor）
2. 证据落盘后再实现，禁止凭感觉调参补洞
3. DOM 壳可与 WebGL 并行，但合并前各自可验证

## 6. 模块执行顺序（落盘计划）

| ID | 模块 | 产出文档 | 验收 |
|---|---|---|---|
| M0 | 总览 + 资源清单 | `00-overview.md`（本文件）、`scratch/asset-refs.txt` | 路由/栈/资源表完整 |
| M1 | 设计 token + DOM 壳（loader/header/menu） | `01-shell.md` | 静态壳像素/字体接近；无 WebGL |
| M2 | 静态资源下载（fonts/draco/basis/models/ktx2/audio） | `02-assets.md` + `public/unseen-studio-static/` | 资源可本地加载 |
| M3 | Home WebGL（TARGET_LOCK → baseline） | `03-home-webgl.md` + extractor 产物 | 与生产截图对照 |
| M4 | Projects 页 | `04-projects.md` | 列表/菜单 3D 过渡 |
| M5 | Contact 页 | `05-contact.md` | 表单/布局 |
| M6 | World 页 | `06-world.md` | dark 世界交互 |
| M7 | 音频 / 光标 / 转场 | `07-polish.md` | 交互 parity |
| M8 | 接入 h5 路由 + Menu | `08-integration.md` | `/unseen-studio/*` 可访问；QA 通过 |

## 7. Scratch 已落盘

路径：`unseen-restore/scratch/`

- `index.html`, `projects.html`, `contact.html`, `world.html`
- `style.css`, `manifest.js`, `vendor.js`, `theme.js`
- 后续：`asset-refs.txt`, `theme-signals.txt`

截图证据（Playwright 工作区）：`unseen-co-home.png` 等。

## 8. 状态（2026-07-15）

- M0–M3：壳 + 资源 + Home WebGL（水/草/grain PARTIAL）已接入  
- M4–M8：Projects / Contact(+相机) / World(DOM 拖拽) / 音频 mute / 路由文档 ✅  
- 仍 Deferred：fluidSim、packed-LOD 水、完整 grass RawShader、EffectComposer SavePass、Dom2Webgl、Projects 3D menu、World 真·球体
