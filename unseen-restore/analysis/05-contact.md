# M5 — Contact

## SOURCE

- Route: `/contact/` · `data-router-view="homeContact"` · body `page-template-home-contact`
- Shared shell `.js-contact-content`: Say hello / New Business ↔ General
- Emails: `projects@unseen.co` (NB), `hello@unseen.co` (General)
- Offices: Bristol 35a Colston Avenue BS1 4TT · London 90 Paul Street EC2A 4NE
- WebGL: `contactRoom` visible · `cameraPathProgress` → `0`

## Local

| 项 | 路径 | 标签 |
|---|---|---|
| DOM content | `pages/ContactPage.tsx` | SOURCE |
| Room swap + camera lerp | `createHomeScene.setMode('contact')` | SOURCE |
| Dom2Webgl 3D HTML | `DomParallax` + contact enter CSS | PARTIAL · pointer depth / panel enter；真 Dom2Webgl HTML mesh Deferred |

## Acceptance

- Contact route shows Say hello panel; camera slides toward contact pose; `room-2` visible
