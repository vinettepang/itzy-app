# 01 · 内容模型与布局（单页长滚动）

> 修正：Work / Contact 不是弹层，而是 **Lenis 平滑滚动**到对应区块。整站是单页长滚动。

## 页面纵向结构

```
[固定 header]  logo / Design&Engineering / 中上 mono 文案 / 右上 WORK 简介 / 导航 Work·Contact·THEME[A]·SOUND[-]
[固定 footer]  左: GMT+8 CN HH:MM 33°C   右: 0960 X 0540 Y
[WebGL 背景]   贯穿全屏固定层（天空渐变 + 光线 + hello 玻璃字 + 流体）

section HERO
  - 大标题 I BRING / CRAFT & TASTE / TO DIGITAL WORK
  - 副文案 I explore how to shape AI-era workflows...
  - I'm building reunimos™, and previously worked on Alibaba aDrive, Teambition, and 100offer.

section WORK （逐条，右侧大预览图 hover/进入切换 01/02）
  每条：TAG / NAME / YEAR / (可选 TOOLS↗ | EVENT↗)

section CONTACT
  - INNOVATE WITH PURPOSE
  - LET'S CREATE SOMETHING EXTRAORDINARY
  - CURIOSITY.WEN@GMAIL.COM (mailto)
  - TWITTER/X · FIGMA · GITHUB
```

## Work 条目（精确顺序与文案）

| # | TAG | NAME | YEAR | 角标 | href | 图 |
|---|---|---|---|---|---|---|
| 1 | CODING PROJECT | REUNIMOS™ | 2024-2026 | | /reunimos | work/reunimos01,02 |
| 2 | CODING PROJECT | INSPIRE MONO | 2025 | | /inspire_mono | work/inspire_mono_01,02 |
| 3 | CODING PROJECT | WASM DESIGN UTILS | 2025 | | /wasm_design_utils | work/wasm01,02 |
| 4 | CODING PROJECT | VECTORSYMBOLS | 2023 | TOOLS ↗ | (外链) | work/vs01,02 |
| 5 | CODING PROJECT | DARKSIDE | 2021 | TOOLS ↗ | (外链) | work/ds01,02 |
| 6 | (无 tag) | ADRIVE 阿里云盘 | 2020-2022 | | /adrive | work/ali01,02 |
| 7 | (无 tag) | SHORE ICON | 2022 | | /shore_icon | work/si,si02 |
| 8 | (无 tag) | TEAMBITION | 2018-2020 | | /teambition | work/s01,s02 或 sd01,sd02 |
| 9 | (无 tag) | FOF: SEE HEAR TOUCH | 2022 | EVENT ↗ | (外链) | work/c4? |
| 10 | (无 tag) | FOF: DESIGN SYSTEM | 2021 | EVENT ↗ | (外链) | work/? |

> 图与条目的精确对应、以及 sd01/s01 归属，待逐条 hover 核对。

## Header 文案

- Logo：`haoqi` + `.design`（wght 700 wdth 120）
- 副标：`Design &` / `Engineering`
- 中上（mono）：`Thinking in systems.` / `Designing with care.`
- 右上小标：`WORK`
- 右上简介：`I'm Haoqi Wen, leading Design Engineering and AI exploration at ■■■■■■, engineering, and AI at scale. Outside work, I build design tools for team efficiency.`（`■` 打码块）
- 导航：`Work` `Contact` `THEME[A]` `SOUND[-]`（`-`/`|` 状态字符切换）

## Footer 实时信息

- 左：`GMT+8 CN HH:MM 33°C`（时钟按分钟走 + 天气温度）
- 右：`NNNN X NNNN Y`（鼠标坐标，跟随移动，4 位补零）

## 交互

- 导航 Work/Contact → Lenis 平滑滚动到区块
- 导航 hover → `before:` 虚线描边（border-2 border-dotted，颜色 label-1）
- THEME[A] → light/dark/system 循环
- SOUND[-] ↔ SOUND[|] 声音开关
- Work 项 hover → 右侧预览图在 01/02 间切换 + 可能有位移/缩放
- prefers-reduced-motion 降级
