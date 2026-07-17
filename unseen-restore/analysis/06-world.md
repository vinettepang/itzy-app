# M6 — World

## SOURCE

- Route: `/world/` · `page-template-world` · dark
- Intro: “Drag to explore our world”
- Data: inline `worldData = [...]` (58 media items · image/video · color · caption)
- Production: full WebGL globe/drag media plane (Deferred)

## Local

| 项 | 路径 | 标签 |
|---|---|---|
| Slim data | `data/world.slim.json` | SOURCE |
| Drag globe (fibonacci sphere of cards) | `scene/createWorldScene.ts` + `WorldPage` | PARTIAL · all media items on sphere; yaw/pitch drag · denser production sphere still deferred |
| Theme | dark shell via `unseen-studio--world` | SOURCE |

## Acceptance

- Dark page; drag-rotate cylinder of media; click opens details
- Dev: media via `/unseen-proxy` (Vite) to avoid CORS on WebGL textures
- ktx2 → jpg fallback when needed
