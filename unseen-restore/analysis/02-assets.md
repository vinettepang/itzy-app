# M2 — 静态资源

> 下载目标：`apps/h5/public/unseen-studio-static/`  
> Manifest：`unseen-restore/scratch/download-manifest.txt`

## 结果（SOURCE）

- **43 / 43** 条目下载成功（约 **6.92 MB**）
- 含：字体、Draco、Basis transcoder、home GLB、KTX2、project-menu 模型、音频、svgsprite、favicon、生产 CSS/JS 副本

## 本地路径约定

| 逻辑 URL | 物理路径 |
|---|---|
| `/unseen-studio-static/resources/assets/...` | `public/unseen-studio-static/resources/assets/...` |
| `/unseen-studio-static/public/...` | `public/unseen-studio-static/public/...` |

生产 `globalData`：

```json
{
  "publicUrl": "https://unseen.co/wp-content/themes/unseen/public/",
  "assetsUrl": "https://unseen.co/wp-content/themes/unseen/resources/assets/"
}
```

本地对应：

```ts
export const UNSEEN_PUBLIC = '/unseen-studio-static/public/';
export const UNSEEN_ASSETS = '/unseen-studio-static/resources/assets/';
```

## 缺口（后续补）

- Projects 列表用的 `wp-content/uploads/**/*.ktx2` 未进首批 manifest  
- World 页专用模型/贴图未采集  
- `draco_decoder.js` 若生产另有路径需再核  
- Eyes 动画用的位图序列 `resources/assets/images/eyes-*`（theme 硬编码片段）待补

## 状态

- [x] Home 核心资源可离线加载  
- [ ] Projects / World 资源清单  
