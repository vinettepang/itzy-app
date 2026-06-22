# ITZY 官网 · 首页 UI 设计规范

> 文档版本：v1.0  
> 角色：UI Designer  
> 依据：[ITZY官网产品设计文档.md](./ITZY官网产品设计文档.md) §7、§8  
> 参考风格：[Oh Ira Design](https://ohira.design/) · [Virgil Abloh Archive](https://www.virgilabloh.com/) · [Fácil](https://facilagencia.com/) · [STUDIO PRODUCT](https://studio-product.com/typologies/on-model) · [FLUORO](https://fluoro.london/)

---

## 1. 设计方向

### 1.1 一句话气质

**「档案感编辑部 + K-pop 现场能量」** — 像浏览一份被精心编排的 MIDZY 档案，而不是传统偶像资讯站。

### 1.2 参考站提炼

| 站点 | 借鉴元素 | 在本站的应用 |
|------|----------|--------------|
| [Oh Ira Design](https://ohira.design/) | 大字标、点分副标、加载仪式感、极简顶栏 | 首屏字阶、Loader、`schedules · dolls · cheer` 副标 |
| [Virgil Abloh Archive](https://www.virgilabloh.com/) | 等宽元数据栏、网格、版本号、档案编号感 | 顶栏 `DD/MM/YY`、场次 `TOUR-03 · DAY-01` 编号 |
| [Fácil](https://facilagencia.com/) | 横向重复文字带、留白、轻幽默语气 | 底部 Marquee：`MIDZY · ITZY · WDZY · TWINZY` |
| [STUDIO PRODUCT](https://studio-product.com/typologies/on-model) | 大图主导、时尚留白、克制导航 | 主视觉全出血海报 / 场次 Hero |
| [FLUORO](https://fluoro.london/) | 态度标题、粗体对比、网格开关感 | 模块标题字重、快捷入口 Grid |

### 1.3 设计原则

1. **单一主视觉**：回归海报与下一场演唱会互斥，全屏级占比 ≥ 60vh
2. **信息分层**：元数据（小、等宽）→ 标题（大、无衬线）→ 行动（线框按钮）
3. **编辑感 > 装饰感**：少渐变、少圆角卡片堆叠；用边框、网格、字距建立秩序
4. **移动端优先**：应援场景以手机竖屏为主，触控热区 ≥ 44px

---

## 2. 设计系统（Design Tokens）

### 2.1 色彩

| Token | 值 | 用途 |
|-------|-----|------|
| `--bg-base` | `#F4F4F0` | 页面底色（档案纸感，参考 VAA） |
| `--bg-elevated` | `#FFFFFF` | 顶栏、浮层 |
| `--ink-primary` | `#0A0A0A` | 主文字 |
| `--ink-muted` | `#6B6B6B` | 次要说明 |
| `--ink-meta` | `#9A9A9A` | 等宽元数据 |
| `--border` | `#0A0A0A` | 1px 实线边框 |
| `--border-light` | `#D8D8D4` | 分隔线、网格 |
| `--accent` | `#E85D75` | ITZY 点缀（应援行高亮同源，仅小面积） |
| `--accent-comeback` | 由运营海报主色提取 | 回归期倒计时数字强调 |

> 默认界面保持**黑白灰编辑风**；品牌色只出现在 CTA hover、倒计时、成员标签点缀。

### 2.2 字体

| 层级 | 字体 | 字重 | 字号（Mobile / Desktop） |
|------|------|------|--------------------------|
| Display | `Helvetica Neue`, `Arial`, system-ui | 700–900 | 40px / 72px |
| H1 | 同上 | 700 | 28px / 48px |
| H2 | 同上 | 600 | 18px / 24px |
| Body | 同上 | 400 | 14px / 16px |
| Meta | `ui-monospace`, `SF Mono`, monospace | 400 | 11px / 12px |

- 英文品牌词：**WDZY**、**Twinzy**、**ITZY**、**MIDZY** 保持原拼写，全大写或首字母大写按品牌规范
- 中文辅助信息用 Body，行高 1.5

### 2.3 间距与栅格

| Token | 值 |
|-------|-----|
| 页面左右边距 | 16px（mobile）/ 32px（desktop） |
| 区块间距 | 48px（mobile）/ 80px（desktop） |
| 栅格 | 4 列（mobile）/ 12 列（desktop） |
| 最大内容宽 | 1280px，主视觉可突破全宽 |

### 2.4 圆角与边框

- 默认 **0–2px** 圆角（偏编辑/档案风）
- 按钮：1px 实线边框，无填充；hover 反色
- 主视觉图片：0 圆角或 2px，无重阴影

---

## 3. 全局框架

### 3.1 页面结构

```
┌─────────────────────────────────────────────────────────┐
│ META BAR          22/06/26 · KST · ITZY OFFICIAL FAN HUB │  ← Virgil 风元数据条
├─────────────────────────────────────────────────────────┤
│ NAV    ITZY          SCHEDULES  DOLLS  CHEER  BOARD  ≡   │  ← 固定顶栏
├─────────────────────────────────────────────────────────┤
│                                                         │
│              【主视觉区 · 二选一】                        │
│         回归海报 + 倒计时  OR  下一场演唱会 Hero            │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ QUICK ACCESS    四宫格快捷入口                            │
├─────────────────────────────────────────────────────────┤
│ MARQUEE         MIDZY · ITZY · WDZY · TWINZY →          │  ← Fácil 风
├─────────────────────────────────────────────────────────┤
│ FOOTER          © MIDZY · policy · ENG                   │
└─────────────────────────────────────────────────────────┘
```

### 3.2 顶栏（Nav）

| 元素 | 规格 |
|------|------|
| 高度 | 56px（sticky，毛玻璃 `backdrop-filter: blur(12px)`） |
| 左侧 | `ITZY` 字标，点击回首页 |
| 中间/右侧 | `Schedules` `Dolls` `Cheer` `Board` — 14px，全大写，字距 0.08em |
| 当前页 | 下划线 2px，非加粗（Studio Product 式克制） |
| Mobile | 汉堡菜单收纳链接；字标居中 |

### 3.3 元数据条（Meta Bar）

参考 [Virgil Abloh Archive](https://www.virgilabloh.com/) 顶部信息带：

```
22/06/26          PAGE 01 / HOME          KST 18:00          v.001
```

- 11px 等宽字体，颜色 `--ink-meta`
- 滚动时 Meta Bar 可收起，Nav 保留

### 3.4 入场 Loader（可选，参考 Oh Ira）

- 时长 1.5–2s，仅首次访问 Session 内展示
- 中央：`ITZY` 大字 + 跳动字母效果（如 `MIDZY` 中某一字母）
- 副标：`schedules · wdzy · twinzy · cheer · board`
- 退出：fade out，主内容 fade + 8px 上移

---

## 4. 主视觉区（核心）

主视觉二选一，**同一位置、同一尺寸容器**，避免布局跳动。

### 4.1 状态 A：回归期

**触发**：`periodStartsAt ≤ now ≤ comebackAt` 且 `published=true`

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│              [ 回归宣传海报 · 全宽全出血 ]                  │
│                    aspect-ratio: 3/4 ~ 4/5               │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │ COMEBACK          ALBUM TITLE                      │  │
│  │ 12 : 04 : 33 : 21    DAYS HRS MIN SEC              │  │
│  │ [ WATCH TEASER ]              [ CHEER GUIDE → ]    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

| 元素 | 说明 |
|------|------|
| 海报 | 运营上传 `posterUrl`，`object-fit: cover`，最小高度 65vh |
| 叠加层 | 底部线性渐变 `transparent → rgba(0,0,0,0.55)`，保证白字可读 |
| 标题 | `title` 可选，Display 字号，左下对齐 |
| 倒计时 | 等宽数字，距 `comebackAt`；单位小字 `D/H/M/S` |
| CTA | `Watch Teaser`（外链 P1）、`Cheer Guide`（跳转回归曲应援 P1） |
| 点击海报 | 整图可点，跳转回归详情或 MV（P1） |

**视觉关键词**：档案公告、杂志拉页，非电商 Banner。

### 4.2 状态 B：非回归期 · 下一场演唱会

**数据**：最近一场 `published=true` 且 `startsAt > now` 的场次

```
┌──────────────────────────────────────────────────────────┐
│  META   TOUR 03 · SEOUL · KR                             │
│                                                          │
│              NEXT SHOW                                   │
│                                                          │
│              DAY 1                                       │  ← Display 超大
│                                                          │
│         KSPO DOME                                        │
│         2026.03.15  18:00 KST                            │
│                                                          │
│    [ VIEW DETAIL ]          [ ALL SCHEDULES → ]          │
│                                                          │
│         ┌─────────────────────────┐                        │
│         │   场次封面图（可选）      │                        │
│         └─────────────────────────┘                        │
└──────────────────────────────────────────────────────────┘
```

| 元素 | 规格 |
|------|------|
| 轮次标签 | Meta 行：`TOUR 03` 或 `FM 02`，等宽 + 国家代码 |
| 主标题 | `DAY 1` / `DAY 2`，Display 72px（desktop） |
| 场馆 | H1 28px |
| 时间 | Body + `KST` 后缀；副行小字显示本地时区转换（可选） |
| 封面 | 右侧（desktop）或标题下方（mobile），灰度默认，hover 彩色 |
| CTA 主 | `VIEW DETAIL` — 线框按钮，进入场次详情 |
| CTA 次 | `ALL SCHEDULES →` — 文字链 |

**空状态**：无未来场次时，主视觉改为文案 `NO UPCOMING SHOW` + 链接查看历史场次。

### 4.3 主视觉切换动效

- 回归 ↔ 演唱会：crossfade 400ms，禁止硬切
- 倒计时：每秒 flip 或 opacity pulse（subtle，避免炫技）

---

## 5. 快捷入口区（Quick Access）

MVP 保留四格，参考 [FLUORO](https://fluoro.london/) 网格与 [STUDIO PRODUCT](https://studio-product.com/typologies/on-model) 服务入口。

```
┌─────────────┬─────────────┐
│  SCHEDULES  │    DOLLS    │
│  演唱会      │  WDZY/Twinzy│
├─────────────┼─────────────┤
│    CHEER    │    BOARD    │
│  歌曲应援    │   留言板     │
└─────────────┴─────────────┘
```

| 卡片 | 内容 | 交互 |
|------|------|------|
| Schedules | 英文标题 + 中文 12px 副标 | 跳转演唱会列表 |
| Dolls | 副标展示 `WDZY · Twinzy` | 跳转娃娃图鉴 |
| Cheer | 副标 `韩中歌词应援` | 跳转曲目列表 |
| Board | 副标 `leave a message` | 跳转留言板 |

**样式**

- 1px `--border` 网格，无间隙（整体像一个 table）
- hover：反色 `bg: #0A0A0A; color: #FFF`
- 每格最小高度 120px，内容垂直居中

---

## 6. 次要区块（MVP 可省略）

| 区块 | P1 规格 |
|------|---------|
| 最近娃娃 | 横向 scroll，3 张缩略图 + `WDZY` 角标 |
| 常用应援曲 | 2 条文字链：`WANNABE →` `LOCO →` |

首页 MVP **不展示**以上区块，保持主视觉 + 快捷入口即可。

---

## 7. 留言板入口预览（可选条）

在主视觉与快捷入口之间，可增加一条轻量引导（不替代 Board 页面）：

```
──────────────────────────────────────────────────
  LEAVE A MESSAGE — 无需登录，审核后展示
  [ 昵称 ] [ 留言内容…………………… ] [ SEND ]
──────────────────────────────────────────────────
```

- 单行压缩表单，降低门槛
- 提交后 toast：`已提交，审核通过后将展示`
- Mobile：点击展开为 bottom sheet

---

## 8. Marquee 底栏

参考 [Fácil](https://facilagencia.com/) 重复文字带：

```
← MIDZY · ITZY · WDZY · TWINZY · CHEER · MIDZY · ITZY · …
```

- 12px 全大写，字距 0.2em
- 无限横向滚动，速度 30s/loop
- 纯装饰，不阻挡点击

---

## 9. 响应式断点

| 断点 | 布局变化 |
|------|----------|
| `< 640px` | 主视觉单列；`DAY 1` 字号降至 40px；Nav 汉堡；快捷入口 2×2 |
| `640–1024px` | 主视觉封面与文字上下排列 |
| `≥ 1024px` | 场次 Hero 左右分栏（文左图右）；最大宽 1280px 居中 |

---

## 10. 组件清单

| 组件 | 变体 | 说明 |
|------|------|------|
| `MetaBar` | default | 日期、页码、时区、版本 |
| `SiteNav` | sticky | 主导航 |
| `HeroComeback` | — | 海报 + 倒计时 + CTA |
| `HeroNextShow` | empty | 场次信息 + CTA |
| `QuickAccessGrid` | 4-cell | 快捷入口 |
| `MarqueeStrip` | — | 底部滚动条 |
| `ButtonOutline` | primary / ghost | 线框按钮 |
| `Countdown` | d/h/m/s | 等宽数字 |

---

## 11. 交互与动效

| 场景 | 动效 |
|------|------|
| 首屏进入 | Loader → content fade up 600ms |
| 导航切换 | 下划线 slide 200ms |
| 快捷入口 hover | 反色 150ms ease |
| 海报视差 | 轻微 scroll parallax 5%（可选，回归期） |
| 倒计时 | 数字 tabular-nums，秒 tick opacity |

减少自动播放视频；回归预告以静态海报为主。

---

## 12. 无障碍

- 倒计时：`aria-live="polite"` 每分钟播报一次，避免每秒读屏
- 海报：`alt` 使用回归 `title`
- 对比度：叠加层上文字 WCAG AA
- 焦点：线框按钮 `:focus-visible` 2px outline

---

## 13. 线框总览（Mobile）

### 13.1 回归期

```
┌─────────────────────┐
│ 22/06/26    v.001   │
│ ITZY          ≡     │
├─────────────────────┤
│                     │
│   [ 回归海报全屏 ]   │
│                     │
│ COMEBACK            │
│ 12:04:33:21         │
│ [TEASER] [CHEER]    │
├─────────────────────┤
│ SCHEDULES │ DOLLS   │
│ CHEER     │ BOARD   │
├─────────────────────┤
│ ← MIDZY · ITZY …    │
└─────────────────────┘
```

### 13.2 非回归期

```
┌─────────────────────┐
│ 22/06/26    v.001   │
│ ITZY          ≡     │
├─────────────────────┤
│ TOUR 03 · SEOUL     │
│ NEXT SHOW           │
│ DAY 1               │
│ KSPO DOME           │
│ 2026.03.15 18:00    │
│ [DETAIL] [ALL →]    │
│ [ 封面图 ]          │
├─────────────────────┤
│ SCHEDULES │ DOLLS   │
│ CHEER     │ BOARD   │
├─────────────────────┤
│ ← MIDZY · ITZY …    │
└─────────────────────┘
```

---

## 14. 与 PRD 对齐检查

| PRD 要求 | UI 方案 |
|----------|---------|
| 回归期展示海报 | §4.1 全出血 Hero + 倒计时 |
| 非回归期仅一条下一场 | §4.2 单场 Hero，无列表 |
| 场次 Day 1/Day 2 | Display 主标题 |
| WDZY/Twinzy 仅英文 | Dolls 入口与 Marquee 保持英文 |
| 快捷入口四模块 | §5 Quick Access Grid |
| 留言板访客可发 | §7 可选首页压缩表单 + Board 入口 |
| 主视觉互斥 | §4 同一容器二选一 |

---

## 15. 交付物建议

| 交付 | 格式 |
|------|------|
| 本规范 | Markdown（本文档） |
| 高保真稿 | Figma：Home / Comeback / NextShow 三 Frame |
| 切图 | 海报比例 4:5、封面 16:9 |
| 开发标注 | Meta Bar 高度 24px、Nav 56px、Hero min 65vh |

---

## 16. 总结

首页 UI 以 **Virgil 档案元数据 + Oh Ira 入场仪式 + Studio Product 时尚留白** 为骨架，用 **一场演唱会 / 一张回归海报** 作为唯一主视觉，下接 **四格快捷入口** 串联演唱会、娃娃、应援、留言四大模块。整体保持黑白编辑感，仅在倒计时与 hover 态引入少量品牌色，符合产品设计文档的「单一主视觉、低干扰」原则。
