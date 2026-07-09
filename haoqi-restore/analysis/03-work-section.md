# 03 · Work 区块布局（#selected-work）

> 还原自生产环境 DOM 探测（2026-07-09）

## 结构

- Section id: `selected-work`
- 容器：`grid grid-cols-12`，`row-gap: ~75px`
- 每项为 `<article>` + `<a class="group block space-y-3 p-2">`

## 卡片内容

1. **图片区** `aspect-ratio` 按项目不同（见下表），WebGL 层在生产中与 DOM rect 对齐；复刻版用 `<img>` + hover 叠图
2. **标签** 右上角 `bg-selection`（#c0fe04）黑字 mono uppercase — 仅 Coding Project 类有
3. **标题行** flex justify-between：左 truncate 标题，右 mono tabular 年份 + 可选 Tools/Event ↗

## 12 列错落（lg / xl）

| # | 项目 | gridClass | aspect-ratio |
|---|---|---|---|
| 1 | Reunimos™ | col 5 / span 8 | 1332/750 |
| 2 | Inspire Mono | col 1 / span 6 (xl: span 5) | 3840/2160 |
| 3 | Wasm design utils | col 7 / span 6 (xl: span 5) | 3840/2160 |
| 4 | VectorSymbols | col 5 / span 4 (xl: 6/span 3) | 1440/936 |
| 5 | DarkSide | col 9 / span 4 (xl: 10/span 3) | 1440/936 |
| 6 | aDrive | col 1 / span 4 (xl: span 3) | 1064/1496 |
| 7 | Shore Icon | col 5 / span 4 (xl: span 3) | 2160/2160 |
| 8 | Teambition | col 9 / span 4 (xl: span 3) | 1200/1200 |
| 9 | FoF See Hear Touch | col 5 / span 4 (xl: 6/span 3) | 1000/1000 |
| 10 | FoF Design System | col 9 / span 4 (xl: 10/span 3) | 1000/1000 |

移动端：全宽或 `span 6` 两列（与生产 col-span-6 项一致）。

## 实现位置

- 数据：`apps/h5/src/pages/haoqi/workData.ts`
- 样式：`haoqi.css` → `.haoqi__workGrid` + `.haoqi__workItem--g1..g10`
- 页面：`HaoqiPage.tsx` → `#selected-work`

## 待补

- ~~生产 WebGL work curl/流体遮罩层~~ ✅ `createHaoqiScene` work 平面 + uReveal
- ~~滚动进入视口 reveal~~ ✅ IntersectionObserver → `uReveal`
