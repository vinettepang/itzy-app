# 03 — 调试记录

## Loader 卡住（已修复）

**现象：** 页面一直显示 `unseen LABS` loader，WebGL canvas 存在但不进入主场景。

**根因：** `unseen-dc.glb` / `metal-dc.glb` 使用 Draco 压缩，`GLTFLoader` 未配置 `DRACOLoader`。

**控制台错误：**
```
THREE.GLTFLoader: No DRACOLoader instance provided.
```

**修复：**
- `createRefractionScene.ts` 中创建共享 `DRACOLoader` + `GLTFLoader`
- Decoder 文件复制到 `apps/h5/public/draco/gltf/`（离线可用）
- `setDecoderPath('/draco/gltf/')`

## Shader 提取污染（已修复）

GLSL 文件首尾残留反引号 `` ` ``，导致 shader 编译失败。已用 `scripts/fix-glsl.mjs` 批量清理。

## Loader 错误态（已改进）

若场景初始化失败，`onProgress(100)` 但无 `handle` 时 loader 永不消失。

**修复：** `onError` 回调强制 `hideLoader()`。

## 布局黑边（已修复）

`.webgl-refraction` 包装器无定位/尺寸，`canvas.gl-canvas` 的 `position:absolute` 无法铺满视口。

**修复：** 添加 `.webgl-refraction { position:fixed; inset:0; ... }` + `--screen-height` JS 写入。

## 全屏黑色背景（已修复）

**现象：** 本地页面像「黑底」，生产站为浅灰 `#e4e4e4` + 中央胶囊视窗。

**根因：** 生产环境 WebGL 使用透明 canvas（`alpha: true`, `autoClear: false`, `setClearColor(0,0)`），灰色来自页面背景；我们用了 `alpha: false`，canvas 默认不透明黑色铺满全屏。

**修复：**
- `createRefractionScene.ts` 对齐生产 renderer 配置（透明 canvas）
- 页面挂载时强制 `html/body/.webgl-refraction` 背景 `#e4e4e4`（覆盖 h5 全局蓝色渐变）
- 补全 UI：`UiDecor`（顶栏 logo、左右竖排标签）、Created By 署名

**验证：** `webgl-refraction-restore/qa/local-bgfix.png` vs `production-bgfix.png`（1400×900）

## 待对齐项

- [ ] Loader 完整 SVG mask 动画（当前为简化文字版）
- [ ] 四角 logo / 侧边竖排标签
- [ ] Demo 02 首次进入 cursor 文字淡入
- [ ] FPS 自适应 DPR
- [ ] 与生产站截图逐像素对比
