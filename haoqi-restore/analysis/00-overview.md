# haoqi.design 复刻 · 总览分析 (00-overview)

> 目标：将线上生产环境 https://haoqi.design 的代码还原，加入到 `apps/h5` 项目中。
> 生产环境无 source map，需结合下载的静态资源 + 运行时探测 + 视觉比对进行重建。

## 1. 技术栈（探测结论）

| 项 | 结论 | 证据 |
|---|---|---|
| 框架 | **Next.js (App Router + Turbopack)** | `_next/static/chunks`、`turbopack-*.js`、无 `__NEXT_DATA__`(RSC) |
| 样式 | **Tailwind CSS v4**（CSS-first，`@layer properties`/`@theme`） | styles.css 结构 |
| 3D | **Three.js**（matcap + envMap 反射材质，GLSL） | chunk 特征扫描：three/glsl/matcap/envmap |
| 动画 | **GSAP** + **Lenis**（平滑滚动） | chunk 特征扫描 |
| 字体 | **TikTok Sans**（可变，wght+wdth）+ **Geist Mono**（可变 wght） | `/fonts/TikTokSans.ttf`, `/fonts/GeistMono[wght].ttf` |
| 主题 | light / dark / system 三态（`.dark` class + `color-scheme`） | CSS tokens |

> 注意：目标项目是 **Vite + React 18 + React Router**（非 Next）。移植时将 Next App Router 页面改为 React Router 路由，RSC/Next 专有能力用普通 React 组件替代。

## 2. 站点结构与路由

- `/` 首页（单页 + 覆盖层）
- 项目详情路由：`/reunimos` `/inspire_mono` `/wasm_design_utils` `/adrive` `/shore_icon` `/teambition`
- 首页内覆盖层（按钮触发，非路由）：**Work**（作品列表）、**Contact**（联系）

## 3. 首页视觉分区（自上而下 / 固定层）

固定 `header`（`z-50 fixed inset-0 flex flex-col justify-between`，`pointer-events-none`，内部按钮 `pointer-events-auto`）：

- **左上**：Logo `haoqi.design`（font-sans bold uppercase，`font-variation-settings: wght 700, wdth 120`）；下方标题 `Design & Engineering`
- **中上**：`Thinking in systems.` / `Designing with care.`（mono）
- **右上**：`WORK` 小标 + 简介：`I'm Haoqi Wen, leading Design Engineering and AI exploration at ■■■■■■, engineering, and AI at scale. Outside work, I build design tools for team efficiency.`（`■` 为打码/涂黑效果）
- **右上导航**：`Work` `Contact` `THEME[A]` `SOUND[|]`（桌面 `hidden lg:flex`，hover 出现虚线描边 `before:border-dotted`）
- **底部左**：实时信息 `--:-- GMT+8 CN`（时钟）+ 天气 `33°C`
- **底部右**：鼠标坐标 `0960 X 0540 Y`（实时跟随）
- **中央背景**：WebGL 画布（1920×1080）——蓝天渐变 + 光线扫过 + 3D 镀铬手写体 `hello`
- **左下大标题**：`I BRING CRAFT & TASTE TO DIGITAL WORK`（超大 sans 黑体，uppercase）
- 网格准星：四角/中线的 `+` 十字标记与浅色引导线

滚动/副文案：`I explore how to shape AI-era workflows with craft and taste, building the next generation of digital products. I'm building reunimos™, and previously worked on Alibaba aDrive, Teambition, and 100offer.`

## 4. Work 作品列表（10 项，来自正文与 /work 资源）

| # | 名称 | 年份 | 类型 | 备注 | 缩略图 |
|---|---|---|---|---|---|
| 1 | Reunimos™ | 2024-2026 | Coding Project | | work/reunimos01.png, 02 |
| 2 | Inspire Mono | 2025 | Coding Project | | work/inspire_mono_01.png, 02 |
| 3 | Wasm design utils | 2025 | Coding Project | | work/wasm01.png, 02 |
| 4 | VectorSymbols | 2023 | Coding Project | tools ↗ | work/vs01.png, 02 |
| 5 | DarkSide | 2021 | Coding Project | tools ↗ | work/ds01.png, 02 |
| 6 | aDrive 阿里云盘 | 2020-2022 | | | work/ali01.png, 02 |
| 7 | Shore Icon | 2022 | | | work/si.png, si02.png |
| 8 | Teambition | 2018-2020 | | | work/s01.png?/sd01.png? |
| 9 | FoF: See Hear Touch | 2022 | event ↗ | | c4.png? |
| 10 | FoF: Design System | 2021 | event ↗ | | |

> 缩略图与条目的精确对应需在 Work 覆盖层展开后核对（待 module 分析）。

## 5. Contact 覆盖层

`Innovate with purpose` / `Let's Create Something Extraordinary` / `curiosity.wen@gmail.com`（mailto）/ 社交：`Twitter/X` `Figma` `GitHub`

## 6. 静态资源清单（生产）

- 3D 模型：`/model/hello.gltf`（首页 hello 文字）、`/model/cursor.glb`、`/model/cnt.gltf`（contact?）
- 字体：`/fonts/TikTokSans.ttf`、`/fonts/GeistMono[wght].ttf`
- 贴纸：`/sticker_img/s_01.png` … `s_12.png`（12 张）
- Work 缩略：`/work/*.png`（各项目 01/02 两态）
- 其他：`/img/m3.png`、`/icon.svg`、`/apple-icon.png`

## 7. 设计令牌（CSS 变量）

### Light（:root）
```
--label: 0,0,0                      文本基色
--label-d: 54,54,48                 次要文本基色
--background-deep: 251,250,244      #FBFAF4 暖白背景
--label-1: rgba(--label,1)          主文本
--label-2: rgba(--label-d,.6)
--label-3: rgba(--label-d,.32)
--label-4: rgba(--label-d,.18)
--line: rgba(--label-d,.1)          分隔线
--background-1: rgb(--background-deep)
--background-elevated: #efede7
--cubic-66: cubic-bezier(.66,0,.01,1)   主缓动
--selection-bg: #c0fe04             选区荧光绿
（code-* 为代码高亮配色）
```

### Dark（.dark）
```
--label: 255,255,255
--label-d: 230,232,232
--background-deep: 15,17,17         #0F1111
--background-elevated: #191b1b
--label-4: .16  --line: .08
```

### 语义 class（HTML 中出现）
- `text-l1` = label-1，`font-mono-2` = Geist Mono，`font-sans` = TikTok Sans
- 主缓动 `--cubic-66`，过渡 `duration-300 ease-out motion-reduce:transition-none`

## 8. 交互要点

- 导航项 hover：`before:` 虚线描边框（`border-2 border-dotted`）
- header `pointer-events-none`，仅交互元素 `pointer-events-auto`（背景可透传给 canvas）
- 主题切换 THEME[A]，声音切换 SOUND[|]
- 底部实时时钟（GMT+8）、天气（°C）、鼠标坐标（X/Y）
- 平滑滚动（Lenis）、GSAP 动效
- `prefers-reduced-motion` 降级

## 9. 复刻计划（模块顺序）

1. **shell**：字体 + 主题系统 + 固定 header + footer 实时信息（时钟/天气/坐标）+ 网格准星
2. **hero-webgl**：Three.js 场景（天空渐变 shader 背景 + hello.gltf 镀铬材质 + 光线）→ 用 web-shader-extractor 深挖
3. **hero-type**：大标题 + 简介文案排版
4. **work**：Work 覆盖层（列表 + 缩略图 hover 切换）
5. **contact**：Contact 覆盖层
6. （可选）项目详情路由

每模块：分析文档 `NN-<module>.md` → 实现 → 浏览器截图比对 → 修正。

## 10. 落地位置（h5 项目）

- 路由：新增 `/haoqi`（`apps/h5/src/pages/haoqi/`）
- 静态资源：`apps/h5/public/haoqi/`（models/fonts/work/sticker_img）
- 分析文档：`haoqi-restore/analysis/`
- 生产资源镜像：`haoqi-restore/assets/`
