# M3 — Home WebGL

> 生产表面：`canvas#gl`  
> Scout：`analysis/scout-card.json` → **TARGET_LOCKED**

## SOURCE 事实

| 项 | 证据 |
|---|---|
| 唯一 WebGL 表面 | `canvas#gl` WebGL2 |
| Owner | `theme.js` HomeContact |
| 模型表 | `room-1/2, chair, pillows, rocks, table-3, land-group, grass-simple` + `objectsData.glb` |
| 贴图表 | KTX2 `room-1/2, chair, pillows, rocks, table, pearl-matcap, particles, skymap-tile, ao` |
| 材质 | `MeshBasicMaterial({map})`；桌面 `envMap+reflectivity`；珍珠球 `MeshMatcapMaterial` |
| 变换 | `applyObjectTransforms(obj, name)` ← `objectsData[name].position/rotation/scale` |
| 相机 | `CatmullRomCurve3(cam.children)` / `tgt.children`，home 时 `cameraPathProgress=1` |
| 小鼠标角 | `mouseMoveAngleX:0.135`, `mouseMoveAngleY:0.035` |

## 本地实现（RAW_REPLAY → projectize）

路径：`apps/h5/src/pages/unseen-studio/scene/createHomeScene.ts`

已包含：

- Draco + KTX2 加载本地 `unseen-studio-static`
- 物体变换 + 贴图材质 + matcap 球 + skymap 球
- 相机 curve `@ progress=1` + 指针微旋转
- Loader 进度绑定真实加载

## 水面（本轮）

| 项 | 标签 | 说明 |
|---|---|---|
| pose `(-0.1193, 0.007851, 0.048929)` · rotX -90 · scale 0.5 | SOURCE | theme `buildWater` |
| tint `0xE2E5F6` · AO · gradient-noise 扰动 | SOURCE | uniforms 来自 theme |
| fluidSim → `uFluidTexture` | SOURCE / PARTIAL | `createFluidSim.ts`（jt 参数 128/force20） |
| packed / mip LOD 反射 | PARTIAL · SOURCE-shaped | 自定义 Reflector + mipmapped RT + `texture2D(..., lod)`；atlas `packedTexture2DLOD` 仍 Deferred |
| 实现 | `scene/createWater.ts` + `createFluidSim.ts` | |

## 颗粒

| 项 | 标签 |
|---|---|
| InstancedMesh 300 · billboard · `particles.ktx2` | SOURCE · `createParticles.ts` |

## 已知缺口（诚实标签）

| 缺口 | 标签 |
|---|---|
| 草地 InstancedMesh（5k–25k）+ blade.jpg | SOURCE RawShader（风 curl + fog）；scale.y PARTIAL（theme `.005`→本地 `.016` 可读） |
| packed-LOD 水面 atlas | SOURCE-shaped · `createPackedMipmapper.ts` + water `packedTexture2DLOD` |
| film grain + fluid screen pass | PARTIAL（`createGrainPass.ts` 合入 fluidPass 扭曲） |
| packed-LOD 水面反射 | SOURCE-shaped · atlas mipmapper 已接 |
| Dom2Webgl「View our work」3D HTML | PARTIAL · DOM hero + `DomParallax`；`createHomeText` plane ready、待对齐 ho 变换后显示 |
| Contact 房间切换 | SOURCE · `setMode('contact')` 相机 lerp |

## 状态

- [x] TARGET_LOCKED  
- [x] REPLAY_READY  
- [x] BASELINE + 水面保真对照（PARTIAL）：`local-home-water.png` 已有反射水体  
- [x] 接入 Layout `#gl`  
- 本地截图：`scratch/webgl/local-home-grass-v2.png` vs 生产 `prod-home-entered.png`  
- 草地/颗粒：`createGrass.ts` + `createGrainPass.ts` 已接入渲染循环  

- 修复记录：主题包内 Draco 与 three@0.184 不兼容 → 改用 `/draco/gltf/` 
 
