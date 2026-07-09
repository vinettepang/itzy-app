# 02 · Hero WebGL 场景（Three.js）

> 场景代码全部在 `assets/chunks/7758f29a8aeb1c60.js`。
> 提取的 GLSL：`analysis/shaders/7758f29a8aeb1c60__*.glsl`（美化版 `analysis/scene/shaders-pretty/`）。
> 场景配置窗口：`analysis/scene/scene-windows.md`。

## 渲染管线（概念）

1. **背景渲染到 RT**：先把场景背景（天空/渐变 + 其他模型）渲染到离屏 RenderTarget，`setClearColor(theme.bg,1)`。
2. **玻璃折射**：`hello.gltf` 网格用自定义 ShaderMaterial 采样上一步的纹理 `uTexture`，按 RGB 分通道 IOR 折射（色散）+ Fresnel + 高光 → 液态玻璃/镀铬观感。
3. **后期**：LensFlarePass（星芒/光晕）、可能的 bloom。postprocessing 库（chunk 含大量 pp pass）。
4. **交互流体**：velocity/pressure/divergence/curl 的 Navier-Stokes fluid（鼠标扰动），影响背景/贴纸。
5. **贴纸粒子**：12 张 `sticker_img` 打成 atlas，InstancedMesh 下落飘散（滚动/点击触发）。

## 模型与变换（组件 `cp`）

```
hello.gltf:  scrollSyncFactor .72, modelPosition [-.1,0,2],
             beforeRotation [0,240,0], afterRotation [0,90,0], rotation [0,4,0],
             scale 22 (桌面) / 19 (移动), section "banner", tintEnabled
cursor.glb:  modelPosition [11.6,-4.2,-3] (桌面)/[6.6,-5.6,-3](移动),
             rotationAxisTilt [0,0,45], afterRotation [0,720,0], scale .1,
             tingColor ["#009dff","#009dff","#64c3ff","#64c3ff"]  (h_star)
cnt.gltf:    beforeRotation [-180,0,0], scale 19, section "footer",
             tingColor ["#FFFFFF","#009dff","#8e9dc4","#64c3ff"]  (contact 3D)
```

## 玻璃色散材质（hello）— ShaderMaterial

顶点着色器（`__8`）：输出 `worldNormal`、`eyeVector = normalize(worldPos - cameraPosition)`、`modelLocalY`。

片元（`__9`，见 `shaders-pretty/7758f29a8aeb1c60__9.glsl`）：分通道 refract → 采样 `uTexture` 累加（uLoop 次）→ 饱和度/亮度/对比/gamma → 有色玻璃透射（Beer-Lambert / Hard Light，`uDark`）→ Fresnel 边缘 + 高光。

默认 uniform（SOURCE，@320216）：
```
uIorR 1.15  uIorY 1.16  uIorG 1.18  uIorC 1.22  uIorB 1.22  uIorP 1.22
uRefractPower .24   uChromaticAberration .24   uSaturation 1
uShininess 40   uDiffuseness .1   uFresnelPower 6
uBrightness 1   uContrast 1   uGamma 1
uSpecularStrength 1.2   uFresnelStrength 1   uFresnelSideDir (-1,.3,1)
uLight (4,9,.5)
uTintColorA/B vec4(1,1,1,1)   uTintLocalYRange (0,1)   uTintEnabled 0/1
uLoop（RGB 模式 <=3 时 uRgbRefraction=1，走 3 通道；否则 6 通道 RYGCBP）
```

## 背景/星芒模型 shader（`__11`）— sampleHyperspace

uniform：`iResolution, iTime, uScrollDuration, uAccentColor(cg), uStripeColorA(cv), uStripeColorB(cA), uStripeReveal, uLight(4,9,.5), uShininess 40, uDiffuseness .1, uSpecularStrength 1.2, uFresnelPower 6, uFresnelStrength 1, uFresnelSideDir(-1,.3,1)`
`sampleHyperspace`：极坐标径向 cell 图案（cellDensity 100），随 `iTime/uScrollDuration` 推进——用于星芒/超空间过渡效果。

## 贴纸粒子（sticker）参数（SOURCE @225737）

```
sources: /sticker_img/s_01.png … s_12.png  (12)
particleCount 12, spawnWidth 32, clickSpawnWidth 24, spawnHeight 24,
clickSpawnHeight 24, positionY 24, fallDistance 48, zDepth 4, zOffset -6,
windStrength 1.8, windFrequency .3, scale 1.4, clickScale 1.4,
rotationSpeed .8, fallSpeed 1.8
```
atlas：把各图 padding 后拼到 POT 画布，`uvRect` 实例属性定位子图。vertex `s4` / fragment `s6`（`__3/__4`）。

## 相机

GLTFLoader 内建 camera 解析（模型可能自带相机）。主渲染相机透视，具体 fov 待运行时读取（`analysis/scene` 未直接给出主相机 fov，模型 `hello.gltf` 可能含 camera）。→ 复刻先用 PerspectiveCamera fov 35~50 试配。

## 颜色符号（待解析常量 cg/cv/cA）

`uAccentColor=cg`、`uStripeColorA=cv`、`uStripeColorB=cA`；star tingColor `#009dff/#64c3ff`，contact tingColor `#FFFFFF/#009dff/#8e9dc4/#64c3ff` → 整体蓝色调（与首页天蓝观感一致）。

## 复刻优先级

1. **P0**：hello.gltf + 玻璃色散材质 + 背景渲染到 RT（核心镀铬字） ✅ 初版
2. **P1**：天空渐变 + sampleHyperspace 星芒全屏 shader ✅ 2026-07-09 接入
3. **P1**：LensFlarePass 星芒后期 ✅
4. **P2**：贴纸粒子下落 ✅
5. **P2**：鼠标流体 ✅
6. **P2**：cursor.glb 星标 + cnt.gltf contact 3D ✅

### 2026-07-09 更新

- `SKY_FRAG` 升级为生产 `sampleHyperspace` 的 2D 全屏适配版（`uAccentColor/#b8daf4`, stripe `#009dff`/`#64c3ff`）
- hello 模型加载后 `centerObject3D` 居中
- `uScrollReveal` 随 banner 滚动从 1→0.65
- Header 布局：logo+nav 顶行，brand/center/intro 独立 overlay 层
