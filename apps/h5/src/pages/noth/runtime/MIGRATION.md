# Noth 还原一致：差距分析与路线图

目标：在 **不依赖 `8cae500c5405-main.js`** 的前提下，与 [noth.in](https://www.noth.in/) 视觉与动效一致。  
默认 **React runtime**（`runtime/*.ts`）；legacy 仅当 `VITE_NOTH_LEGACY_MAIN=true`。

---

## 1. 三层还原（不要只盯 JS）

| 层 | 现状 | 不一致时表现 |
|----|------|----------------|
| **资源** | `pnpm run setup:noth` 按 manifest 补 `assets/` | 图裂、视频空、hero 无遮罩素材 |
| **字体** | IBM Plex 已脚本下载；**PP Neue Montreal** 常缺/损坏 | 字重、间距、行高整体「像 Arial」 |
| **DOM** | 首页/Works 由 `_archive-html` 生成 | 缺块 = 永远对不齐 |
| **CSS** | Webflow 两份 min.css + chrome 内嵌 `html{font-size:1vw}` | rem 体系错则全站比例偏 |
| **JS** | legacy 全量 vs react 部分 | 见下表 |

---

## 2. JS：`NAVIGATE_END` 全量对照

`main.spa.js` 每次换页大致执行（压缩名 → 职责）：

### 2.1 清理（换页必须先 kill）

| 符号 | 职责 |
|------|------|
| `xM` / `pM` | loader 计时器、计数动画 |
| `pA` | 销毁 WebGL fluid (`qr`) |
| `AA` | showreel scrub tween |
| `KA` | works 大字 DOM 重排、resize 监听 |
| `eC` | 某类 video 克隆/清理 |
| `lC` | timeline-next 滚轮 hijack |
| `cC` | parallax ST |
| `pC` | glitch 区全部 ST/timeline |
| `bC` | studio `musee-w` pin/scale 清理 |
| `fx` / `tC` | 光标跟随 3D 物体、work 区清理 |
| `RC` | footer SVG path 动效清理 |
| `wA` | 某 wrap hover |
| `IC` | 菜单 teardown |

React 模式：`destroyNothPageRuntime()` 需 **逐项对齐** 上述清理，否则换页叠 ST/泄漏 WebGL。

### 2.2 绑定（还原核心）

| 符号 | 职责 | React | 一致度 |
|------|------|-------|--------|
| `o_` / `a_` / `Gy` | SplitText 行字 + opacity/scale + 字体就绪 | `reveals.ts`（**无 SplitText**，依赖 DOM 里已有 `.line-child`） | ⚠️ 无预拆行处会缺字 |
| `lc` | loader 后播 `no-scroll` 队列 | `loader:hero-reveal-start` + `reveals.ts` | ✅ react |
| `vM` / `hM` / `dM` / `gM` / `tf` | loader 时间轴 + hero 字标揭示 | `loader.ts` + `heroReveal.ts` | ✅ react |
| `mx` / `dA` / `mA` | Hero **WebGL 流体遮罩** | `heroWebgl.ts` + `main.hero.mjs`（精简 FC） | ✅ react |
| `Mv` | 顶栏 **logo SVG** clip/translate | `navLogo.ts` | ✅ react |
| `px` / `DC` | 桌面 hover 菜单 / 移动全屏菜单 | `menu.ts` + `scrollLock.ts` | ✅ react |
| `P_` | `[hoverme]` 字母 hover | `microInteractions.ts` | ✅（页内无 `[hoverme]` 时无感） |
| `L_` / `D_` / `I_` / `U_` | 按钮箭头、View all SVG、链接下划线、email @ 缩放 | `microInteractions.ts` | ✅ react |
| `Ev` | showreel pin + 宽高 scrub | `showreel.ts` | ✅ 桌面 |
| `qv` / `Yv` / `$A` / `Xv` / `Zv` / `$v` | **WORKS** 标题字母 Flip、grid、**clip 揭示**、平滑光标、`(07)` 计数、列表 gallery | `worksSection.ts` | ✅ react（无 Taxi case flip） |
| `Kv` | **formes-w** 装饰图鼠标跟转 | `formes.ts` | ✅ react |
| `ux` / `bC` | **studio-video** `musee-w` pin、双 video、Sound | `studioMusee.ts` | ✅ react |
| `hx` | 全站 video 懒加载 IntersectionObserver play | `videoIo.ts` | ✅ react |
| `cx` | **glitch** 字符雨 + 图 parallax + finaltext | `glitch.ts` | ✅ react |
| `dx` | **footer-nothin-svg** path 入场 | `footerSvg.ts` | ✅ react |
| `jv` | case `.next-project-w` 下一项文案/链接 | `caseNextProject.ts` | ✅ react |
| `Qv` / `lC` | `.timeline-next-w` 底栏滚轮填满 → 下一项 | `timelineNext.ts` | ✅ react（需 DOM） |
| `rx` + parallax-img | 区块视差 | `scrollMotion.ts` | ✅ |
| `_x` / `vx` | lazy→eager、refresh | `scrollRefresh.ts` | ✅ |
| `cy` + ST proxy | Lenis | `lenis.ts` | ✅ |
| `Fy` Taxi | 页间过渡 flip | `pageTransition.ts` + View Transitions / GSAP | ⚠️ 近似 |

### 2.3 覆盖率（粗估）

- **React 已覆盖**：~25–30% 的「体感」（滚动、基础揭示、部分视差、showreel、简 loader）。
- **要对齐首屏 WOW**：必须补 **loader 时间轴 + WebGL hero + logo**。
- **要对齐首页中段**：**works 区 + studio pin + glitch + footer SVG**。
- **要对齐 Works 页**：**Zv / 列表 flip / 全项目 grid**。

---

## 3. 路由与页面（非 main 但影响「一致」）

| 原站路径 | 本地 | 状态 |
|----------|------|------|
| `/` | `/noth` | ✅ 归档 DOM |
| `/works` | `/noth/works` | ✅ |
| `/works/:slug` | `NothWorkCasePage` 占位 + flip 过渡 | ⚠️ 待归档 case HTML |
| studio / contact 等 | placeholder | ❌ |

Case 与内页需：**抓 HTML → `generate:noth` → 路由**，否则链接只能 legacy 或 404。

---

## 4. 推荐执行顺序（按用户可见优先级）

### 阶段 A — 基线（1–2 天）

1. 固定 **对比环境**：同 viewport、`setup:noth` 完整、有效 **PP Neue Montreal** woff2。
2. 做 **逐屏 checklist**（首屏 / works / showreel / studio / glitch / footer / works 页）。
3. React 模式：`destroyNothPageRuntime` 对齐 main 的 kill 列表（至少 ST + 未来 WebGL）。

### 阶段 B — 低成本交互（易拆、明显）

新建 `runtime/microInteractions.ts`，移植：

- `I_` 链接下划线（归档里部分已有 DOM，需绑事件）
- `L_` / `D_` / `U_` 按钮
- `P_` hoverme

→ 不依赖 Three.js，拆 main 风险低。

### 阶段 C — 首屏一致（最难、最关键）

1. **`loader.ts`** 对齐 `vM`：计数、图片带、`loader:hero-reveal-start` / `loader:hero-revealed` 自定义事件（与 main 相同，便于后面对接 WebGL）。
2. **`heroWebgl.ts`**：从 main 抽出 `gA` / `dA` / `mA`（~WebGL fluid + canvas），或 **短期** 子路径动态 `import('./noth-hero-webgl.chunk.ts')` 从 main 复制类（不整包加载）。
3. **`navLogo.ts`** 移植 `Mv`（纯 GSAP + SVG）。

验收：首访 loader → hero 遮罩随鼠标/时间轴 → logo 与 noth.in 一致。

### 阶段 D — 首页内容区

1. **`worksSection.ts`**：`qv` + `$A` + `Xy`（clip-path 揭示、标题 flip、W'07）。
2. **`studioMusee.ts`**：`ux` pin + 双 video + sound（`bC` 清理）。
3. **`formes.ts`**：`Kv` — ✅ 已接入。
4. **`glitch.ts`**：`cx` — ✅ 已接入。
5. **`footerSvg.ts`**：`dx` — ✅ 已接入。
6. **`videoIo.ts`**：`hx` — ✅ 已接入。

### 阶段 E — Works 页 + 路由

1. Case 归档 `_archive-html/works/<slug>/index.html` → `generate:noth` 产出 `NOTH_CASE_PAGES` — ✅ 管线（0 case 时为空表）。
2. 首页 work 链、`/noth/works/:slug`、flip 过渡 — ✅。
3. Taxi 级 flip 精修（`pageTransition.ts`）— ⚠️ 可继续对齐 `Uy`。

### 阶段 F — 收尾

1. `lineDom.ts` + `reveals.ts` 无 `.line-child` 拆行 — ✅。
2. 默认 React runtime（仅 `VITE_NOTH_LEGACY_MAIN=true` 加载 legacy）— ✅。
3. 文档 `public/noth/README.md` — ✅。

---

## 5. 工程约定（避免返工）

1. **一个 main 符号 → 一个 `runtime/xxx.ts`**，导出 `init(scope)` + `destroy()`，在 `index.ts` 注册顺序与 `NAVIGATE_END` 一致。
2. **先写 destroy 再写 init**（对照 main 里 `pC`、`bC` 等）。
3. **开发时双轨**：同一屏 legacy vs react 截图 diff；通过后再从 `MIGRATION` 表打 ✅。
4. **不要**在 React 里再写一套简化 DOM（`WorkCard` 等已废弃方向）；DOM 只信 `generated/*`。

---

## 6. 立即可做的下一步（建议）

| 优先级 | 任务 | 产出 |
|--------|------|------|
| P0 | 校验字体 + `setup:noth` | 排除假 woff2 |
| P1 | `microInteractions.ts` + 注册 | ✅ 已接入 React runtime |
| P2 | 完整 `loader.ts` + `heroReveal.ts` | ✅ 已接入 |
| P3 | `heroWebgl.ts` + `main.hero.mjs` | ✅ 已接入（仍含 Three 体积，但不跑整站 init） |
| P4 | `worksSection.ts` | ✅ 已接入（`Xv`/`qv`/`$A`/`Zv`/`$v`） |

完成 P1–P4 后，React 模式可达 **~60–70%** 首页一致；剩余 glitch/footer/works 页/case 按阶段 D–E 推进。
