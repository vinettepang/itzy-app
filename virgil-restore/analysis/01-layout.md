# 布局与交互

## 主页信息流

1. **固定 Header**（Simon Mono）
   - 行 1：`LAST UPDATED 2026` · `DD/MM/YY` · `PAGE N/A` · `[ VAA_ANNOUNCEMENT ]`
   - 行 2：VAA 字标 + 徽章 SVG + `↗ NIKE X2` + `↗ CANARY YELLOW` + `HH:MM`
   - 虚线分隔
   - 行 3：`V.A.A. ARCHIVE` · `DD/MM/YY` · `MISSION` / `ANNOUNCEMENT`

2. **Hero 标题**
   - Desktop：`ANNOUNCEMENT` 超大字，`transform: translateY(20vw) rotate(-20deg)` 入场
   - `The Virgil Abloh Archive` 85px Business System

3. **正文**（逐字 stagger 动画，字间距展开）
   - 两段 Archive 介绍 + Mission

4. **证书区** `certificate-canvas-container`
   - Three.js r183 平面 + curl 形变 + 全息 foil shader
   - 贴图：`/images/certificate.png` + `/images/certificate_foil.png`

5. **注册区** `Join the archive`
   - Name / Email / Student checkbox / Sign Up
   - Privacy + Terms 链接

## 背景层

- 全屏 `#1C4A96` 底色
- 固定 VAA 大水印 SVG（右下，低透明度，scroll 入场 `bzdonk`）
- 胶片噪点 `noise.png` overlay（mix-blend-mode: hard-light, opacity 0.03）

## 交互

| 按键 | 行为 |
|---|---|
| `I` | 切换 `html.site-inverted`（`filter: invert(1)`） |
| `Space` | 主题循环 `advanceTheme` |

## 响应式

- `max-width: 700px`：Header 固定顶栏、证书高度 `vh * 1.2`、标题字号 `15.3vw`
