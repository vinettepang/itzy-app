# 02 — h5 实现说明

> 路由：`/facil` 及子路由  
> 代码：`apps/h5/src/pages/facil/`

## 已完成模块

| 模块 | 状态 | 说明 |
|---|---|---|
| M1 设计系统 | ✅ | `facil.css` token、icomoon/times/libertinus 字体 |
| M2 全局壳 | ✅ | Header、Footer、Cookie、React Router |
| M3 滚动视差 | ✅ | Lenis + GSAP ScrollTrigger |
| M4 Canvas | ✅ | `#Interface__Canvas` 字标淡化 + 自定义光标 |
| M5 首页 | ✅ | 10 项目卡片、哲学卡、滚动字幕 |
| M6 子页 | ✅ | trabajos / filosofia / people / contact |
| M7 项目详情 | ✅ | `/facil/projects/:slug` billboard + blocks |
| M8 移动导航 | ✅ | Sidemenu + IndexBar（≤480px） |
| M9 国际化 | ✅ | `/facil/en` 英文路由 + 语言切换 |
| M10 法律/CMP | ✅ | 法律页 + Cookie CMP + GA（需同意） |

## 静态资源

`apps/h5/public/facil-static/`

- `fonts/` — times.woff, icomoon.woff, libertinus
- `images/sprite.svg` — 生产 SVG sprite（备用）

## 路由表

| 路径 | 组件 |
|---|---|
| `/facil` | FacilHomePage |
| `/facil/trabajos` | FacilWorksPage |
| `/facil/filosofia` | FacilFilosofiaPage |
| `/facil/people` | FacilPeoplePage |
| `/facil/contact` | FacilContactPage |
| `/facil/projects/:slug` | FacilProjectPage |
| `/facil/politica-de-privacidad` 等 | FacilLegalPage |
| `/facil/en` | FacilHomePage（英文） |
| `/facil/en/works` 等 | 英文子页 |

## 已知差距

- [ ] Canvas 字标绘制精度（当前为简化 FACIL 文字 + 内联 SVG 页脚字标）
- [ ] Vimeo 视频签名过期 → 项目详情使用 poster 静态图
- [ ] 英文项目详情文案完整翻译（当前复用西语内容）
- [ ] Filosofía 方法论英文标签翻译

## 本次修复（M1–M6 收尾）

- 修正页脚/项目卡 client logo CDN 路径（Educo、Festina、Pescanova、Real Madrid、Tosta Rica）
- Filosofía 页还原 `block-metodologia` 结构：卡片网格 + 侧栏滚动 + 绿标签进度带
- Works 侧栏图片列表加倍以实现无缝循环动画
- 路由切换后 `ScrollTrigger.refresh()` 避免视差错位

## 滚动 / 页面切换（对照生产站重做）

生产站机制：

1. **滚动视差**：Lenis + 在 `[scroll-item]` 上设置 `--y = scrollY - itemTop`；子元素 `[scroll-insider]` 用 CSS  
   `transform: translate3d(var(--x), calc(var(--y)*var(--speed)*-1px), 0)`  
   卡片 holder 另用 `--speed-y` / `--speed-x` / `--mod-y` / `--mod-x`。
2. **菜单切换**：`_hide` → `wrap-out` 淡出 → 换页 → `show__effect` 淡入。

h5 实现：`useFacilScroll.ts` + `FacilPageTransition.tsx` + `facil.css` 中对应规则。
