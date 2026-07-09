# 证书 WebGL（Three.js r183）

## 资源

| 文件 | URL |
|---|---|
| 证书底图 | `/images/certificate.png` |
| 全息 foil 蒙版 | `/images/certificate_foil.png` |

本地：`public/virgil-static/images/`

## Shader（chunk 1203）

- **Vertex**：`applyCurl` 纸张卷曲形变（`uCurlAmount`, `uAspect`）
- **Fragment**：全息 foil `hardLight` 混合 + 薄膜颗粒 + bevel

## 配置（chunk 6687 → `certificateConfig.ts`）

- camera: fov 20, z=50
- curl.amount: -1
- scroll 驱动 positionY / scale / rotation
- foil: saturation 0.11, opacity 0.44, contrast 1.68

## 实现

`createCertificateScene.ts` + `VirgilCertificate.tsx`，滚动进度由 `certSection` 的 `getBoundingClientRect` 计算。
