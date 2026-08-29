import { assetUrl } from '@/utils/assetUrl';
export type HaoqiProjectDetail = {
  slug: string;
  title: string;
  published: string;
  year: string;
  tag?: string;
  heroImg: string;
  /** Markdown-lite 正文（见 ProjectMarkdown） */
  body: string;
  links?: { label: string; href: string }[];
};

export const HAOQI_PROJECTS: Record<string, HaoqiProjectDetail> = {
  reunimos: {
    slug: 'reunimos',
    title: 'Reunimos™',
    published: 'May 31, 2026',
    year: '2024-2026',
    tag: 'Coding Project',
    heroImg: assetUrl('/haoqi-static/work/reunimos01.png'),
    links: [
      { label: 'reunimos.cc', href: 'https://www.reunimos.cc/' },
      { label: '@wenhaoqi/wasm_design_utils', href: 'https://www.npmjs.com/package/@wenhaoqi/wasm_design_utils' },
    ],
    body: `Reunimos™ 是我从 2024 年起构建的个人 AI 灵感收藏夹。一个地方，接住你在浏览、阅读、随手截图时掉落的参考：图片、链接、文档、片段想法，先收进来，不必先想好该放进哪个文件夹。

它面向个人：不做协作，也不催促你「整理得更漂亮」。我更希望它像一块私人的视觉记忆板，少花时间管理，多留空间给真正会回访的灵感。

保存之后，AI 会理解内容、补全上下文；界面以视觉优先的方式呈现，让你按颜色、意象，或某一刻模糊的印象去找回来，而不只是靠标题或路径回忆。

动效与界面质感由 Rive、Motion 与 Shader 共同驱动，整体视觉偏向圆润平滑，贴合年轻用户，长时间使用也依然耐看。2025 年还在 Chrome 下接入了 Liquid Glass 特效，让玻璃质感与这套界面语言更统一。

我对 UI 要求很高，现成工具链往往达不到我想要的效果，于是我为自己搭了一整套 UI 工具库，后来打包开源为 [@wenhaoqi/wasm_design_utils](https://www.npmjs.com/package/@wenhaoqi/wasm_design_utils)。图片主色与调色板提取用 \`extractColors\`（\`@wenhaoqi/wasm_design_utils/extract-colors\`）；sRGB ↔ OKLCH 转换用 \`rgb2oklch\`、\`oklch2rgb_abs\`、\`oklch2rgb_rel\`（\`@wenhaoqi/wasm_design_utils/color\`）；squircle / capsule 平滑圆角路径用 \`getSquircle\`、\`getCapsule\`、\`getPath\`（\`@wenhaoqi/wasm_design_utils/squircle\`）。Reunimos 里三者都会用到：取色支撑视觉检索与卡片氛围，OKLCH 负责色彩换算，squircle 路径撑起圆润的界面形态，都是我在做设计、打磨产品时沉淀下来的，后来发布开源，也希望帮到有需要的人。

欢迎去 [reunimos.cc](https://www.reunimos.cc/) 注册体验，保存一张图、一条链接，感受一下这套视觉优先的收藏方式。`,
  },
  inspire_mono: {
    slug: 'inspire_mono',
    title: 'Inspire Mono',
    published: 'May 07, 2026',
    year: '2025',
    tag: 'Coding Project',
    heroImg: assetUrl('/haoqi-static/work/inspire_mono_01.png'),
    links: [{ label: '下载 InspireMono.zip', href: 'https://haoqi.design/fonts/InspireMono.zip' }],
    body: `Inspire Mono 是我在 2025 年一次基于 vibe coding 的实验项目，灵感来自 [RSMS 的字体工作流](https://www.figma.com/community/file/1115382696459820988)：通过 Figma 绘制 glyph，并结合脚本将字形导出为字体。我让 agent 分析了其中关键的字体构建流程，最终定位到基于 [opentype.js](https://opentype.js.org) 的字体生成能力。

最初，我只是想做一个能在 Figma 中绘制并管理图标字体的小工具，类似过去做的 [VectorSymbols](https://www.figma.com/community/plugin/1255914175202017737/vectorsymbols)；但随着开发推进，对字体构建本身的兴趣逐渐超过了图标管理，于是项目开始演变成一个完整的字体构建插件。它支持字体元信息、OpenType Ligatures、数字与符号变体（Stylistic Sets）、替换字形等特性，并逐步扩展出图标字体、字体管理工具以及最终的 InspireMono 字体本身。字体外观则参考并融合了部分 [TikTok Sans](https://www.tiktok.com/font) 的设计特征。

![Cover](https://mysite2026-blog-cyn6.vercel.app/blog/mono/Cover.png)

![Inspire Mono 展示 1](https://mysite2026-blog-cyn6.vercel.app/blog/mono/1.png)

![Inspire Mono 展示 2](https://mysite2026-blog-cyn6.vercel.app/blog/mono/2.png)

![Inspire Mono 展示 3](https://mysite2026-blog-cyn6.vercel.app/blog/mono/3.png)

![Inspire Mono 展示 4](https://mysite2026-blog-cyn6.vercel.app/blog/mono/4.png)

![Inspire Mono 展示 5](https://mysite2026-blog-cyn6.vercel.app/blog/mono/5.png)

![Inspire Mono 展示 6](https://mysite2026-blog-cyn6.vercel.app/blog/mono/6.png)

![Inspire Mono 展示 7](https://mysite2026-blog-cyn6.vercel.app/blog/mono/7.png)

![Inspire Mono 展示 8](https://mysite2026-blog-cyn6.vercel.app/blog/mono/8.png)`,
  },
  wasm_design_utils: {
    slug: 'wasm_design_utils',
    title: 'Wasm design utils',
    published: 'May 31, 2026',
    year: '2025',
    tag: 'Coding Project',
    heroImg: assetUrl('/haoqi-static/work/wasm01.png'),
    links: [{ label: 'npm', href: 'https://www.npmjs.com/package/@wenhaoqi/wasm_design_utils' }],
    body: `@wenhaoqi/wasm_design_utils 是一组浏览器端设计小工具：sRGB ↔ OKLCH 色彩转换、图片取色、以及 squircle / capsule 的 SVG 路径生成。npm：[@wenhaoqi/wasm_design_utils](https://www.npmjs.com/package/@wenhaoqi/wasm_design_utils)。

它最初是在做 [Reunimos™](/reunimos) 时沉淀下来的，后来打包开源。

## 安装

\`\`\`bash
npm install @wenhaoqi/wasm_design_utils
\`\`\`

包是 ESM，WASM 默认内联在包里，一般**不用**自己托管 \`.wasm\` 文件。所有 API 都是 **async**，调用时要 \`await\`。

## 三个模块，按需引入

- **\`@wenhaoqi/wasm_design_utils/color\`** — RGB ↔ OKLCH
- **\`@wenhaoqi/wasm_design_utils/extract-colors\`** — 从图片提取主色
- **\`@wenhaoqi/wasm_design_utils/squircle\`** — 生成平滑圆角 SVG path

也可以从根路径 \`@wenhaoqi/wasm_design_utils\` 一次性导入全部 API。

## 颜色

\`\`\`javascript
import { rgb2oklch, oklch2rgb_abs, oklch2rgb_rel } from "@wenhaoqi/wasm_design_utils/color";

// sRGB 0–255 → OKLCH
const { L, C, h } = await rgb2oklch(128, 100, 231);

// OKLCH → sRGB，直接指定色度
const { R, G, B } = await oklch2rgb_abs(L, C, h);

// 只定明暗和色相，彩度用 0–1 滑杆（更直觉）
const tint = await oklch2rgb_rel(L, h, 0.5);
\`\`\`

\`init()\` 可选。不传的话，第一次调用转换函数时会自动加载 WASM；想在页面启动时预热，可以提前 \`await init()\`。

## 取色

\`\`\`javascript
import extractColors from "@wenhaoqi/wasm_design_utils/extract-colors";

// 从 <img> 提取调色板，第一个色块通常是主色
const [dominant, ...rest] = await extractColors(img);

// 常用参数
const palette = await extractColors(img, {
  pixels: 64000,
  distance: 0.22,
  crossOrigin: "anonymous",
});
\`\`\`

\`input\` 支持：图片 URL 字符串、\`<img>\` / \`Image\`、\`ImageData\`。

## 平滑圆角

普通 \`border-radius\` 在大圆角时转角容易发尖；squircle 用 SVG path 过渡更顺。

\`\`\`javascript
import { getPath } from "@wenhaoqi/wasm_design_utils/squircle";

const d = await getPath("squircle", 200, 120, 16);
pathEl.setAttribute("d", d);
// viewBox 对应：0 0 200 120
\`\`\`

\`shape\` 也可以是 \`"capsule"\`（胶囊形标签、Chip 等）。

## 本站怎么用

文章页图片放大时，会用取色 + OKLCH 生成跟图片主色接近的蒙层背景：

1. \`extractColors\` 取主色
2. \`rgb2oklch\` 转成 OKLCH
3. 按明暗主题调整亮度，再 \`oklch2rgb_abs\` 转回 RGB

这样全屏查看图片时，背景不会突兀地跳成纯黑。

## Next.js 注意

需要在**客户端**使用（依赖 \`Image\` 和 WebAssembly）。放在 \`"use client"\` 组件里，或用动态 \`import()\` 加载即可。`,
  },
  adrive: {
    slug: 'adrive',
    title: 'aDrive 阿里云盘',
    published: 'Jan 07, 2022',
    year: '2020-2022',
    heroImg: assetUrl('/haoqi-static/work/ali01.png'),
    links: [
      { label: 'alipan.com', href: 'https://www.alipan.com/' },
      { label: 'Clarity design', href: 'https://design.teambition.com' },
    ],
    body: `从零搭建阿里云盘设计系统，并参与其长期维护，支撑全端设计语言统一与设计组件复用。参与首页、各版本导航结构与启动器框架，以及影音播放器等业务设计；同时开发或协作开发设计系统文档工具 ADS 客户端与 Figma design token 导出工具。

## Teambition 网盘

Teambition 网盘是阿里云盘的前身。前期为了快速搭建并验证方向，我们选择在 Teambition 主产品内「生长」：底层天然具备协作能力，无论面向企业还是个人，都比从零起步更省力。设计侧同样如此，直接沿用成熟的 [Clarity design](https://design.teambition.com)，也无需再搭一套全新的设计系统。

![首页、传输列表、相册分享菜单](https://mysite2026-blog-cyn6.vercel.app/blog/adrive/ad1.jpg)

![文件预览、文件预览讨论圈点、视频弹幕圈点（概念）](https://mysite2026-blog-cyn6.vercel.app/blog/adrive/ad2.jpg)

在获得外界与集团内部认可之后，我们决定把它做成独立的客户端，并争取到更充裕的研发资源；资源到位之后，也就有条件从零建立一套新的设计系统。

## ADS | Adrive Design System

### ADS 架构

![ADS 架构](https://mysite2026-blog-cyn6.vercel.app/blog/adrive/ad3.png)

ADS 有两个驱动核心：一是设计目标，二是业务目标。我们刻意不把二者混为一谈——业务诉求本身并不会自动指向更好的用户体验。持续迭代、不断补全的设计目标，才是拉升体验的主轴；业务目标则负责在收益与体验之间拿捏分寸，避免过度设计。

### ADS 设计原则

好的工作流能够显著提高团队效率；相较某些偏形而上的设计方法，它对组织而言往往更落地、也更容易推广。设计系统本质上就是设计、产品、工程有机融合的一条工作流，Figma 等工具协作可以帮助完成约 60% 的工作，其余部分要靠管理机制与各相关方达成共识来补齐。

#### 规范简洁

![规范简洁](https://mysite2026-blog-cyn6.vercel.app/blog/adrive/ad4.png)

- 场景命名
- 使用缩写
- 层级清晰

#### 高度复用

![高度复用](https://mysite2026-blog-cyn6.vercel.app/blog/adrive/ad5.png)

![高度复用](https://mysite2026-blog-cyn6.vercel.app/blog/adrive/ad6.png)

- 组件复用
- 跨端一致性
- 统一 Token 管理

#### 可持续性

![可持续性](https://mysite2026-blog-cyn6.vercel.app/blog/adrive/ad7.png)

- 反馈敏捷
- 受控逃逸 / Escape hatch（允许在特殊情况下跨出设计系统的既定限制，避免机制僵化；并非鼓励随意破窗，而是为真实业务留出可控出口）

### ADS 周边工具链

![ADS 周边工具链](https://mysite2026-blog-cyn6.vercel.app/blog/adrive/ad8.png)

ADS 客户端基于 Gatsby 与 Electron 开发，用于承载设计系统文档、组件演示与设计资源整合。对仅有 Figma 查看权限的同学，它还能把多条设计稿链接拼成一张「设计地图」。在团队语境里，大家默认：凡与云盘设计相关的内容，都会在 ADS 客户端里找到对应落点。

Fridge 也被纳入阿里云盘项目，用于把更完整的色板与 icon 实时同步给使用者。

Figma Time Line 是我们借助 Figma 的 Auto Layout「搭」出来的排期看板，全组的工作日程都通过它来对齐。

## 阿里云盘设计概览

![阿里云盘设计概览](https://mysite2026-blog-cyn6.vercel.app/blog/adrive/ad9.jpg)

阿里云盘在上线初期收获好评之后，为了在行业内做出差异化、参与竞争，团队探索了以「场景」为核心的个人云：用户不仅能把数字资产放进云盘，还能按不同使用场景在云盘内完成消费，而不必反复跳转到其他应用，从而形成「存—用」一体的个人数字资产闭环。

![滑动导航与启动器](https://mysite2026-blog-cyn6.vercel.app/blog/adrive/ad10.jpg)

滑动导航是一次有趣的探索：我们希望单一导航栏仍能完整呈现「个人云」的能力版图，又不能牺牲可用性。这一方案在设计冲刺阶段我曾持保留态度，但在原型与可用性测试之后我改变了看法；我接手了与滑动导航相关的全部设计工作，并最终推动上线——日后有机会可以再单独展开当时的推演与取舍。

![多功能菜单、分享菜单](https://mysite2026-blog-cyn6.vercel.app/blog/adrive/ad11.jpg)

多功能菜单既贴合当代产品的操作习惯，又比层层模态与二级页面更轻、更快；相较传统的 Action sheet，它在布局与信息密度上也更自由。这也是许多优质 iOS 与 Android 应用正在采用的设计趋势之一。

![音频播放器、视频播放器、放映室](https://mysite2026-blog-cyn6.vercel.app/blog/adrive/ad12.jpg)

![占位符](https://mysite2026-blog-cyn6.vercel.app/blog/adrive/ad13.jpg)

![高度统一的桌面端](https://mysite2026-blog-cyn6.vercel.app/blog/adrive/ad14.jpg)

最后，在阿里云盘与 Teambition 的这段经历非常充实：不仅让我的设计能力有了明显提升，也结识了许多一路互相促进的伙伴。`,
  },
  shore_icon: {
    slug: 'shore_icon',
    title: 'Shore Icon',
    published: 'Mar 01, 2022',
    year: '2022',
    heroImg: assetUrl('/haoqi-static/work/si.png'),
    links: [
      { label: 'Spotify Icon System', href: 'https://spotify.design/article/refreshing-our-icon-system-the-why-and-how-behind-the-changes' },
      { label: 'Microsoft Fluent System Icons', href: 'https://www.figma.com/community/file/836835755999342788/Microsoft-Fluent-System-Icons' },
    ],
    body: `在 Shore 的工作时间不长，但我做了一套风格现代、维护成本可控的图标系统（Icon System）。过程中主要参考了 [Spotify Icon System](https://spotify.design/article/refreshing-our-icon-system-the-why-and-how-behind-the-changes)、[Microsoft Fluent System Icons](https://www.figma.com/community/file/836835755999342788/Microsoft-Fluent-System-Icons)，以及业内的 SF Symbols。

## 痛点

要做一套好用的图标系统，风格统一、识别清晰、交付与管理简单——听起来是共识，真正落地时每一环都可能变成痛点。

![Material 与 Ant Design 的图标网格](https://mysite2026-blog-cyn6.vercel.app/blog/shore/icon01.png)

## SF Symbols

![SF Symbols 图标与文字系统](https://mysite2026-blog-cyn6.vercel.app/blog/shore/icon02.png)

## Shore Icon System

![Shore Icon 多重线宽说明](https://mysite2026-blog-cyn6.vercel.app/blog/shore/icon07.png)

![Shore Icon 非严格网格](https://mysite2026-blog-cyn6.vercel.app/blog/shore/icon09.png)

## 未来

![VectorS GitHub 版本管理设想](https://mysite2026-blog-cyn6.vercel.app/blog/shore/icon11.png)`,
  },
  teambition: {
    slug: 'teambition',
    title: 'Teambition',
    published: 'May 31, 2026',
    year: '2018-2020',
    heroImg: assetUrl('/haoqi-static/work/s01.png'),
    links: [{ label: 'teambition.com', href: 'https://www.teambition.com/' }],
    body: `Work in progress — this page is not finished yet.

From 2018 to 2020, I worked on product and design at Teambition (Alibaba), focused on collaboration and project management. More details coming soon.

[teambition.com](https://www.teambition.com/)`,
  },
};

export function getProjectBySlug(slug: string | undefined) {
  if (!slug) return undefined;
  return HAOQI_PROJECTS[slug];
}

/** 支持 /haoqi/:slug 与生产同款 /:slug */
export function resolveProjectSlug(pathname: string) {
  const parts = pathname.split('/').filter(Boolean);
  const last = parts[parts.length - 1];
  if (!last) return undefined;
  if (last === 'haoqi') return undefined;
  return HAOQI_PROJECTS[last] ? last : undefined;
}
