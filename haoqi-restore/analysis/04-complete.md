# 04 — 完整场景架构（还原版）— 2026-07-09 完结

## 模块划分

| 模块 | 文件 | 职责 |
|------|------|------|
| 页面壳 | `HaoqiPage.tsx` | Lenis、主题、天气、音效、header/footer |
| Canvas 入口 | `HaoqiHeroCanvas.tsx` | 挂载 `createHaoqiScene` |
| 场景编排 | `scene/createHaoqiScene.ts` | WebGL 全管线 + LensFlare |
| Shader 库 | `shaders.ts` | sky / glass / fluid / flare / sticker / work-layer |
| 数据 | `workData.ts` / `projectData.ts` | Work 网格 + 项目 case study |
| 详情页 | `HaoqiProjectPage.tsx` + `ProjectMarkdown.tsx` | 生产同款长文 |
| Hooks | `useHaoqiWeather.ts` / `useHaoqiSound.ts` | 实时天气 + 氛围音 |
| 打码 | `RedactedCompany.tsx` | passcode 揭示交互 |

## 渲染管线（每帧）

1. 流体 splat → decay
2. Sky → `bgRT`
3. Fluid composite → `compRT`
4. **LensFlare** → `flareRT`
5. 主场景玻璃模型 + 贴纸
6. Work UI 层（curl + hover + **uReveal**）

## 路由

| 路径 | 页面 |
|------|------|
| `/haoqi` | 主页 |
| `/reunimos` … `/teambition` | 项目详情（与生产一致） |
| `/haoqi/:slug` | 同上（别名） |

## 静态资源

`apps/h5/public/haoqi-static/`

## 已关闭的差异项

- ✅ Open-Meteo 上海实时气温
- ✅ 外部 Tools/Event 真实 Figma 链接
- ✅ LensFlare 后处理 pass
- ✅ Work 滚动 reveal（IntersectionObserver → uReveal）
- ✅ 六个项目详情正文（来自生产站）
- ✅ Sound 氛围音 toggle
- ✅ 公司名 passcode 按钮 UI
- ✅ Vite dev/preview SPA fallback + 生产 slug 路由

## 已对齐生产（2026-07-09 最终）

- 导航：统一顶栏（Work / Contact / Theme / Sound），窄视口不再走独立 mobile 布局
- 天气：Open-Meteo 上海实时气温（加载前显示 `--°C`）
- 外链：Figma Tools / FoF Event 真实 URL
- 项目详情：六页完整正文 + 画廊图（CDN）
- WebGL：`sceneConfig.ts` 生产参数 — FOV 42、hello scale 22/19、贴纸 12 粒 + wind
- 音效：默认开启（session 记忆），静态音频占位 + Web Audio 回退

## 仍无法 1:1 的项

- 氛围音：生产 bundle 无公开 mp3 URL
- passcode：正确值不在公开资源中
- Teambition：生产站亦为 WIP
