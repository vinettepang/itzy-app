# M4 — Projects

## SOURCE

- Route: `/projects/` · `data-router-view="projects"`
- Filters DOM: `.project-filters` · All / Branding / Digital / Motion / Experiment
- Data: inline `projects = [...]` in page HTML (36 items)
- CTA: `Looking for a creative partner…` → `projects@unseen.co`
- WebGL: project-menu butterflies / arch / floor (Deferred · PARTIAL — DOM grid instead)

## Local

| 项 | 路径 | 标签 |
|---|---|---|
| Slim data | `data/projects.slim.json` | SOURCE |
| UI filters overlay | `pages/ProjectsPage.tsx` | SOURCE-shaped |
| WebGL scroll wall | `createProjectMenuScene.ts` | SOURCE-shaped · wheel/drag `smoothScrollPos` · camera enter · waterfall cascade · rest offset≈40 |
| Butterflies / arch / floor | same | PARTIAL |
| Card bend shaders (Ts/Ss) + hover `u_innerScale` 1.1 | `createProjectCardMaterial.ts` | SOURCE-shaped · 12×12 plane + world-Y bend |
| Godrays / Highway SavePass transitionPass | — | Deferred · DOM RouteTransition 切片叠化 |

## Acceptance

- Enter Projects: camera eases in (playEnter) + route cream/glitch wipe
- Wheel / drag scrolls project cards vertically with lerp + velocity bend
- Hover scales card UV (u_innerScale → 1.1)
- Filters reposition wall; experiment hidden on All
- Click card opens external/internal link
