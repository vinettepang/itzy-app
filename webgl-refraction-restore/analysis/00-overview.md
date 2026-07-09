# WebGL Refraction — 复刻总览

> 生产站：https://unseen.co/labs/webgl-refraction/  
> 目标：在 `apps/h5` 还原 Unseen Labs Experiment 002 页面

## 技术栈（生产）

| 层 | 技术 |
|---|---|
| 构建 | Vite 单页应用（`index.4b6bd21a.js` + `index.f6b3be7a.css`） |
| 3D | Three.js **r142**（bundle 内嵌） |
| 动画 | GSAP 3.10.4 + CustomEase |
| 样式 | 纯 CSS + 内联 loader 样式 |
| 字体 | Kadabra、Romie、PP Neue Montreal、Claudya |
| 分析 | Google Analytics |

## 页面结构

```
body.light-theme | body.dark-theme
├── .cursor (CLICK + HOLD)
├── .loader (SVG mask 进度)
├── canvas.gl-canvas (WebGL 全屏)
├── .scene-text--1 / .scene-text--2 (固定 HTML 标题层)
└── .ui (四角导航 + credits)
```

## 两个 Demo

| Demo | 主题 | 视觉 |
|---|---|---|
| **01** | `light-theme` | 蓝天云层 procedural sky + 玻璃球折射「unseen」chrome 字 |
| **02** | `dark-theme` | 紫色闪电背景 + 金属 chrome 字 + 更强折射噪声 |

切换方式：导航 `01`/`02`、左右方向键；GSAP `sceneSwitchTl` 驱动 `maskProgress`、天空色、文字 DOM 动画。

## 交互

- **鼠标移动**：相机轻微 parallax；玻璃球跟随指针（桌面）
- **按住 250ms**：`mouseDown` 触发场景专属 timeline（Demo1 放大/扭曲/文字退场；Demo2 金属字旋转）
- **移动端**：球体 X 轴 ping-pong 动画；`TOUCH & HOLD FOR MORE` 提示

## 模块拆分（复刻顺序）

1. **静态壳** — HTML 文案、四角 UI、字体、主题色
2. **Loader** — mask 进度条 + outline stroke 动画
3. **WebGL 核心** — 双 FBO 折射管线 + 自定义 bubble shader
4. **背景** — procedural sky + lightning 贴图
5. **3D 字模** — `unseen-dc.glb` / `metal-dc.glb` + cubemap 反射
6. **Demo 切换** — GSAP timelines（scene / hold）
7. **自定义光标**

## 静态资源

已下载至 `apps/h5/public/webgl-refraction-static/`：

- `textures/` — sky, fill, matcap, lens-flare, lightning*, outline2, small-fill-*
- `models/` — unseen-dc.glb, metal-dc.glb
- `fonts/` — Kadabra, Romie, PPNeueMontreal, claudya
- `cubemap/`, `metalCubemap/` — 6 面环境贴图

## h5 集成

- 目录：`apps/h5/src/pages/webgl-refraction/`
- 路由：`/labs/webgl-refraction`
- 静态：`/webgl-refraction-static/`

## 证据来源

| 标签 | 路径 |
|---|---|
| SOURCE | `webgl-refraction-restore/scratch/index.js`（生产 bundle） |
| SOURCE | `webgl-refraction-restore/scratch/index.html` |
| SOURCE | `webgl-refraction-restore/scratch/index.css` |
