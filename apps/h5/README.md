# ITZY App (H5)

ITZY 粉丝向移动端 Web App —— 用 React + TypeScript + Vite 构建，部署在 GitHub Pages。
聚焦演唱会信息、周边收藏（WDZY / TWINZY）与成员视觉呈现。

- 线上地址：`https://vinettepang.github.io/itzy-app/`
- 本地预览：`http://localhost:3002/`

---

## 技术栈

- **React 18 + TypeScript + Vite 4**
- **pnpm workspace**（monorepo，`apps/h5` 为 H5 子包）
- **GSAP** —— 入场 / 过渡 / 视差动效
- **Lenis** —— 平滑滚动（含触摸滑动阻尼）
- 数据驱动：`src/data/wdzy_twinzy_catalog.json`（周边目录）

> 包管理器固定为 `pnpm@8.15.9`（见根 `package.json` 的 `packageManager` 字段），Node 22。

---

## 本地开发 & 部署（dev / prod 双环境）

本仓库采用 **dev 本地预览 → 确认后 push 生产** 的工作流。

### 1. 克隆与安装
```bash
git clone git@github.com:vinettepang/itzy-app.git
cd itzy-app
pnpm install            # 需 pnpm@8.15.9（可用 corepack 启用）
```

### 2. 启动 dev（本地预览）
```bash
cd apps/h5
pnpm dev                # 默认 http://localhost:3002
```

### 3. 发布到生产
`push` 到 `main` 分支即触发 GitHub Actions：
- 使用 `pnpm@8.15.9` + Node 22 构建
- 构建命令：`PAGES_BASE=/itzy-app/ pnpm vite build`
- 产物自动部署到 GitHub Pages

> ⚠️ 约定：未经显式确认，不执行 `git push origin main`。改动先在 dev 预览确认，确认后再发布。

---

## 功能概览

### 首页 / Home
- 票根风格入口，跳转演唱会列表页。

### 演唱会日程 /schedules
- 黑底满屏、大写标题、胶囊标签（pill tags）视觉。
- 标题格式：`场馆 · 城市`（英文），右侧显示日期。
- 同一场馆连续多天合并为区间（如 `FEB 13 – 15`）。
- 修复列表页无法下滑的问题：清理其它页面遗留的滚动锁（html/body `overflow:hidden`），并接入触摸滑动阻尼。
- 顶部菜单二级页面导航（NewNewLayout 子页面）。

### 周边拖拽世界 /dolls（unseen）
- **选择门**：WDZY / TWINZY 分组，响应式 cover 网格（大屏 5 个一行，小屏自适应 3 / 2 个）。
- **拖拽世界**：鼠标拖拽 / 手指滑动自由探索，每个成员的周边卡片以斐波那契螺旋散开（避免重叠），卡片轻微悬浮。
- **系列分类**：韩版（KR）/ 日版（JP）/ WDZY×SEGA，卡片带彩色系列角标（韩版红 / 日版蓝 / SEGA 金）+ 尺寸（如 `H22×W17`）。
- **产品详情弹窗**：点击任意周边卡片弹出，展示 Line / Size / Model / JAN / Year / Series / Release。弹窗全响应式（窄屏单列、限高滚动）。
- **概览模式**：`All Dolls` 缩放查看全部成员，`Focus` 回到单个成员。
- **「按系列排列」按钮**：一键把混乱（螺旋）布局平滑过渡为**按系列整齐分排**（系列从上到下、行内居中），并显示每系列彩色标题标签；再点 `打散` 回到螺旋。过渡用 CSS `left/top` 缓动 + 逐张错落（stagger），排列时镜头自动拉回该成员中心。
- **自适应**：卡片与弹窗尺寸随屏宽 `clamp()` 缩放，弹窗 `max-height` 限高、≤400px 窄屏信息单列。

### 成员页 /people
- 复刻 [facilagencia.com/people](https://facilagencia.com/people/) 的视差滚动 + 错落网格。
- 页脚 **FÁCIL** logo 字母随页面滚动接近底部时**逐一点亮**（灰 → 黑），分三组 `FA → CIL → ®`，使用内联 SVG symbol 保证字形与线上一致。

### 独立 unseen 世界 /unseen
- 与 `/dolls` 共用数据，但为独立探索世界（样式与交互各自维护，互不影响）。

---

## 版本迭代（Changelog）

### v0.5.0（未发布 · 当前 dev）
> 以下改动已就绪于本地 dev，尚未 push 到生产。

- **dolls｜「按系列排列」按钮 + 混乱→整齐动画**
  - 新增 `neatLayoutByLine()`：按 line（KR / JP / SEGA）把同一成员周边排成居中横排、系列自上而下堆叠，预存 `gridX / gridY` 坐标。
  - 卡片 `left/top` 随 `arranged` 状态切换，CSS `transition`（0.85s 缓动）+ 逐张 `transitionDelay` 形成错落归位；整齐模式去掉悬浮抖动更干净。
  - 整齐模式渲染每系列彩色标题标签（`.unseen-line-label--kr/jp/sega`）；切换时自动 `resetPan` 拉回成员中心。
- **dolls｜WDZY 韩版 / 日版 / WDZY×SEGA 分类数据补全**
  - `wdzy_twinzy_catalog.json`：现有产品补 `line / release` 与尺寸（韩版挂件加 per-member 尺寸、SEGA 娃娃机尺寸更新）；新增 11 个分类（韩版手机壳 / 日版立偶·挂件·手机支架·化妆包·通行证包·零钱包·束口袋·环保包 / SEGA 抱枕·化妆包），缺图复用该成员 plush 占位 → WDZY 共 21 款。
  - 类型扩展：`DollMerch` 增 `line / size / release / region / gridX / gridY` 等字段。
- **dolls｜拖拽世界自适应与弹窗响应式**
  - 选择门中 / 小屏断点修复（列数随屏变化）；merch 卡片由固定像素改为 `clamp()` 自适应 + `aspect-ratio: 2/3`；产品弹窗加 `max-height / 圆角 / 窄屏单列`。

### v0.4.0 — 成员页 /people
- 新增 `/people` 页面，复刻 facilagencia 视差滚动 + 错落网格。
- 页脚 FÁCIL logo 字母滚动点亮（灰→黑，三组），内联 SVG symbol 对齐线上字形。

### v0.3.0 — 周边拖拽世界 /dolls（unseen）
- 新增 unseen 拖拽世界：选择门 + 螺旋分布周边卡片 + 拖拽探索。
- 接入 WDZY / TWINZY 周边目录，使用官方 LINE FRIENDS 立偶图替换占位、补型号（Model / JAN）。
- 响应式画廊：大屏 5 个一行，小屏 2+3 行自适应。

### v0.2.0 — 演唱会日程 /schedules
- 黑底满屏 + 大写标题 + 胶囊标签视觉。
- 英文场馆·城市标题、右侧日期、多天同场馆合并为区间。
- 修复滚动锁与触摸滑动问题。

### v0.1.0 — 项目脚手架
- React + TypeScript + Vite 初始化，pnpm workspace monorepo。
- GitHub Actions → GitHub Pages 部署链路（`PAGES_BASE=/itzy-app/`）。
- 首页票根入口。

---

## 目录结构（节选）

```
apps/h5
├── src/
│   ├── data/
│   │   ├── wdzy_twinzy_catalog.json   # 周边目录（角色 → 产品 → 型号/尺寸）
│   │   └── img/                        # 周边图片资源
│   ├── pages/
│   │   ├── SchedulesPage.tsx          # 演唱会日程
│   │   ├── DollsPage.tsx / .css       # 周边拖拽世界（unseen）
│   │   ├── people/                    # 成员页（视差 + FÁCIL 点亮）
│   │   └── unseen/                     # 拖拽世界数据/布局逻辑
│   └── App.tsx                         # 路由
└── README.md
```
