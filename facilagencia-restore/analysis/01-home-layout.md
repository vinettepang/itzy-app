# 01 — 首页布局与视觉

> 证据：生产 HTML + 截图 + CSS bundle

## 视口概览

```
┌─────────────────────────────────────────────────────────────┐
│ [引言 h1 衬线]              Trabajos Filosofía Personas Contacto │
│                                                             │
│              ┌──────────┐                                   │
│   [POPEYES]  │  video   │        [LÁSERUM video]            │
│              └──────────┘                                   │
│         ████████████████████████████████                    │
│         █        F Á C I L ®           █  ← Canvas2D 巨型字标 │
│         ████████████████████████████████                    │
│              ┌──────────┐                                   │
│              │  video   │                                   │
│              └──────────┘                                   │
│  …更多项目卡片…                                              │
│  [哲学文案 card-info]                                        │
│  ── FACIL es lo contrario de difícil ── (滚动字幕)           │
│  cabify · Davante · educo · FESTINA · láserum · …           │
│  [页脚联系 + 绿标签叠在字标上]                                │
│                                    [Cookie 横幅]            │
└─────────────────────────────────────────────────────────────┘
```

## 顶栏 `#Header`

```html
<header id="Header">
  <nav>
    <a href="/" class="facil-font">Fácil</a>
    <a class="link-arrow" href="/trabajos/"><span>Trabajos</span></a>
    <!-- Filosofía, Personas, Contacto -->
  </nav>
</header>
```

- `facil-font` 使用 icomoon 连字显示品牌字
- `link-arrow` 带箭头 hover 动效（CSS/JS）

## 首页引言

```html
<article class="default home" data-page="home" data-palette="primary" data-logo="black">
  <header class="header-page">
    <h1 class="description">
      Hola, somos una agencia creativa independiente…
      manera <a href="/" class="facil-font">fácil</a> de resolverlos.
    </h1>
  </header>
```

- 衬线体 `Times New Roman`，四行断行
- 内联 `facil-font` 链接强调品牌

## 项目卡片 `.card-project`

每张卡片结构：

```html
<div class="card card-project --pos-{1|2|3|4}" scroll-item>
  <a class="holder" href="/projects/{slug}/" scroll-insider style="--speed-y:0.3; --speed-x:-0.1">
    <div class="media">
      <figure class="media-holder" style="--aspect: 0.562…">
        <video data-video data-item-load data-autoplay muted loop playsinline
               poster="…" src="https://player.vimeo.com/progressive_redirect/…"/>
      </figure>
    </div>
    <header>
      <div class="logo" scroll-insider style="--speed:-0.1">
        <figure class="media-holder"><img … alt="Popeyes_Logo_Gris"/></figure>
      </div>
      <div class="name" scroll-insider style="--speed:-0.15">
        <span class="facil-font">Fácil</span> para Popeyes
      </div>
    </header>
  </a>
</div>
```

### 首页项目列表（SOURCE）

| `--pos` | 客户 | slug |
|---|---|---|
| 2 | Popeyes | `popeyes-nada-mas-nada-menos` |
| 3 | Láserum | `la-mejor-rebaja-de-las-rebajas` |
| 1 | Popeyes | `popeyes-asi-si-asi-yes` |
| 4 | Festina | `unexpected` |
| 3 | Láserum | (另一项目) |
| 2 | Real Madrid | — |
| 1 | Pescanova | — |
| 4 | Láserum (IG) | — |
| 3 | Pescanova | — |
| 1 | Serpis | — |
| 2 | Educo | — |

- `--pos-{1-4}` 控制网格象限定位（非 DOM 顺序）
- 视频源为 Vimeo progressive_redirect URL（带签名，会过期 → 复刻需换静态 MP4 或 poster）

## 哲学卡片 `.card-info`

中间区域独立卡片，长文：

> Creemos en el poder de las relaciones fáciles…

## 滚动字幕带

页脚上方循环文案，每词包裹 `.__word`，部分词用 `facil-font`：

- FACIL es lo contrario de difícil
- FACIL es algo que entiende todo el mundo
- 20 slides son mejor que 320 FACIL
- Hacerlo FACIL es complicado

## 客户 Logo 带

灰度 PNG 横排：cabify, Davante, educo, FESTINA, láserum, PESCANOVA, POPEYES, Real Madrid, SERPIS, Tosta Rica

## 页脚区

滚动到底部时，巨型字标上的绿标签显示：

| 标签 | 内容 |
|---|---|
| Email | hola@facilagencia.com |
| LinkedIn | Linkedin |
| 地址 | Fernando VI 2, 1º Dcha, 28004, Madrid |
| 电话 | +34 608 286 478 |
| Instagram | Instagram |

页脚 SVG：`logo` 全字标、`cuchillo` 制作方标识、Kit Digital 欧盟徽章

## Canvas 叠加层

- `id="Interface__Canvas"`，全视口 `1385×900`（随 DPR 缩放）
- Canvas2D，非 WebGL
- 负责：巨型 FACIL 字标渲染、自定义光标、绿标签定位
- bundle 入口类：`Go`（canvas init）、`Yo`（guides/debug）

## 响应式

- `:root --font-size` 在 `max-width:480px` 时固定 `16px`
- 移动端显示 `TOUCH & HOLD` 类提示（待子页确认）
- `#Sidemenu` 侧栏菜单

## 复刻注意点

1. **字体 icomoon** 必须下载 `/assets/fonts/icomoon.woff` 才能正确显示 FACIL 连字
2. **Vimeo URL** 有签名时效 → 本地用 poster 图或自托管短视频
3. **Canvas 字标** 是视觉核心，需从 bundle 提取绘制逻辑（M4 模块）
4. **视差速度** 每卡片 `--speed-*` 值需逐一对照生产
