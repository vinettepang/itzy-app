# 01 — 布局与 UI 层

## 视口

- `html, body`: `100vw × 100vh`, `overflow: hidden`
- `--screen-height`: JS 写入（移动端地址栏）
- 设计基准：**1920×1080**（`aspect-ratio: 1920/1080`）

## 层级 (z-index)

| z | 元素 |
|---|---|
| 500 | `.loader`, `.cursor` |
| 101 | `.scene-text`, `.ui` |
| 0 | `canvas.gl-canvas` |

## 主题

```css
body.light-theme { color: #000; }
body.dark-theme  { color: #fff; }
```

Demo 02 切换时 `classList.toggle('light-theme'/'dark-theme')`。

## scene-text 排版

### Demo 01 (`.scene-text--1`)

- 标题居中：`Creating` / `the`(Kadabra display) / `Unexpected`
- 副标题底部：`An Unseen Labs™ Experiment` + Twitter pill
- 字号：横屏 `vh`、竖屏 `vw`（见生产 CSS）

### Demo 02 (`.scene-text--2`)

- 标题左 9%：三行横排
- 副标题右 9%：竖排结构
- 切换时 GSAP：`title1` yPercent ±100 淡出，`title2` xPercent stagger 淡入

## UI 四角

| 角 | 内容 |
|---|---|
| top | unseen LABS logo SVG |
| top-left | Demo 01/02 nav + Concept 文案 + Created By (desktop header) |
| top-right | Unseen logo link + globe icon (≥1024px) |
| left | `★ UN_S` 竖排 |
| right | `01_REFRACTION` / `02_REFRACTION` 竖排 |
| bottom-left | Labs 介绍段落 + mobile Demo nav |
| bottom | Created By pill (desktop) |
| bottom-right | Eyes icon + Experiment 002 |

## Nav pill

```html
<div class="nav nav--header">
  <div class="nav__text">Demo</div>
  <button data-btn="0" class="nav__btn js-scene-1 js-nav-btn active">01</button>
  <button data-btn="1" class="nav__btn js-scene-2 js-nav-btn">02</button>
</div>
```

## Loader

- 背景 `#e4e4e4`
- 双 SVG mask：`--mask-progress` / `--loader-progress` 由 `AssetsProgress` 事件驱动
- 完成后 GSAP outline stroke + 淡出

## 链接

- Twitter: `https://twitter.com/uns__nstudio`
- Ellie: `https://twitter.com/_elliegillespie`
- Studio: `https://unseen.co/`
