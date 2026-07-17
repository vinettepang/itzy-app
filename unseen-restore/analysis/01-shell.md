# M1 — DOM 壳层（Loader / Header / Menu）

> 依据：`scratch/index.html` + 生产截图 + `style.css`  
> 目标：在无 WebGL 的情况下复刻门禁与导航壳，路由挂到 `/unseen-studio`

## 设计 Token（SOURCE · HTML 内联 / loader CSS）

| Token | 值 |
|---|---|
| Loader bg | `#212121` |
| Loader muted text | `#424242` |
| Progress / pink | `#efded9` |
| Sans | `Neue Montreal` |
| Serif italic | `Saol Display` (Light / LightItalic) |
| Off-black UI | `#212121`（菜单圆点 fill） |

## DOM 结构（SOURCE）

见 `00-overview.md` §4.2。关键证据：

- `data-router-wrapper` + `data-router-view="homeContact"` → **Highway** 页面转场（theme 信号 Highway:52）
- `asscroll` / `asscroll-container` → **ASScroll**
- `canvas#gl` 在 `.fixed.fill.z-40` 层，与 DOM 分离

## 交互（SOURCE）

1. Loader 资源加载 → 进度条 → 显示 Enter / Enter without audio  
2. Enter 后 loader 退场，露出 WebGL + header/footer CTA  
3. Menu toggle 打开 `.menu`（01 Index / 02 Projects / 03 Contact / 04 World）  
4. Mute、World 圆钮、2025 Wrapped pill

## 复刻策略（本模块）

1. 新建 `apps/h5/src/pages/unseen-studio/`（**不覆盖** 现有 `/unseen`）  
2. 字体先从生产 CDN 或后续本地 `unseen-studio-static` 加载  
3. 先做静态视觉壳 + Enter 门禁状态机；WebGL 占位 canvas  
4. CSS 可裁剪自 `scratch/style.css` 相关选择器，避免整包污染全局

## 验收

- [ ] `/unseen-studio` 显示 loader 视觉接近生产  
- [ ] Enter without audio 可进入「壳层」状态（即使 WebGL 仍为占位）  
- [ ] Header + Menu 链接指向本地子路由  
- [ ] Menu 页 `/menu` 增加 Unseen Studio 分组

## 状态

- 分析：完成  
- 实现：M1 壳已接入 `apps/h5`  
  - 路由：`/unseen-studio`、`/projects`、`/contact`、`/world`  
  - Loader（进度 + Enter / Enter without audio）+ Header + Menu + Wrapped CTA  
  - WebGL 为占位，待 M3  
- Menu 页已增加「Unseen Studio」分组  
