# 05 Visual QA — local `/yc` vs anthnyung.com/yc

Date: 2026-08-27

## Method

- Local: `http://localhost:3002/yc` (Vite h5)
- Prod: `https://anthnyung.com/yc`
- Cursor browser screenshots + a11y snapshots for attached + detached

## Attached (idle roll)

| Check | Local | Prod | Match |
|---|---|---|---|
| Page bg `#2e1f15` + YC page-bg texture | ✓ | ✓ | ✓ |
| Three.js orange ticket roll + hanging stub | ✓ | ✓ | ✓ |
| Soft floor shadow | ✓ | ✓ | ✓ |
| `/yc` back link (plain text, no pill) | ✓ after CSS reset | ✓ | ✓ |
| `TEAR OFF TICKET` / disabled `SAVE` | ✓ | ✓ | ✓ |
| Title `Startup School 2026 — Anthony Ung` | ✓ | ✓ | ✓ |

## Detached (after tear)

| Check | Local | Prod | Match |
|---|---|---|---|
| Callout TICKET SECURED + copy | ✓ | ✓ | ✓ |
| Flat MeshGradient ticket + paper noise | ✓ | ✓ | ✓ |
| FlutedGlass stub (vertical ribs) | ✓ | ✓ | ✓ |
| SVG copy (name, ADMIT ONE, 2026) | ✓ | ✓ | ✓ |
| Corner + perforation masks | ✓ | ✓ | ✓ |
| ROLL ANOTHER + enabled SAVE | ✓ | ✓ | ✓ |
| Roll hidden after fly-away | ✓ | ✓ | ✓ |

## Interaction

- Tear phase labels + timing fire correctly (`TEARING…` → detached ~1.5s+)
- Web Audio chop/settle (browser-gated; no console errors)
- 4 canvases: roll + mesh + noise + glass

## Fixes during QA

1. `@paper-design/shaders-react` installed
2. TicketRoll named export wiring
3. Global `webgl-refraction` `a` styles were pill-boxing `/yc` — reset in `yc.css`
4. Document title set on mount

## Residual / acceptable deltas

- FlutedGlass `image`: SOURCE omitted prop; restore uses orange SVG data-URL (stub hue match)
- Three.js warns `PCFSoftShadowMap` deprecated (r184) — visual still soft shadows
- Back link targets `/menu` instead of self `/yc`
