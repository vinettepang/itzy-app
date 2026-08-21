# wakawaka.world — 00 Overview

> Production: https://wakawaka.world/  
> Scout date: 2026-07-31  
> Goal: reconstruct lost source into `apps/h5` under `/wakawaka/*`

## Verdict (TARGET_LOCKED — DOM site)

This is **not** a WebGL/shader site. `web-shader-extractor` does **not** apply (no canvas / WebGL / Unicorn).

| Fact | Evidence | Label |
|---|---|---|
| Stack | Sanity CMS (`cdn.sanity.io/images/8yrspuwy/...`) + custom frontend with `__PLATO_DATA__` SSR hydration | SOURCE |
| Bundles | `/assets/css/main.70b996280a0584e708e4.css`, `/assets/js/main.5bb1921e206f6126a1c9.js` | SOURCE |
| Motion | GSAP-style inline transforms on menu/grid; homepage layout crossfade | PARTIAL |
| Fonts | `Waka Sans` woff2 (4 weights/files preloaded) | SOURCE |
| Palette | Page bg `#edeae4`, ink `#28282a`, selection `#c9c7c5` | SOURCE |
| Brand | “WAKA WAKA” — LA wood furniture studio, Shin Okuda | SOURCE |

## Information architecture

```
/                              homepage · giant “Waka” type + featured chair grids
/studio                        about / contact / press
/catalogue                     FW/20 numbered index of chairs
/furniture                     furniture hub
/furniture/chair-collection    filtered collection (ALL / CHAIR / …)
/furniture/{category}          dining-meeting-tables, desks, seating, …
/{slug}                        product detail (e.g. /cylinder-back)  ← NOT under /furniture/
```

Homepage featured chairs (from Plato):

1. Cylinder Back → `/cylinder-back`
2. Double Cylinder Back → `/double-cylinder-back`
3. Compartment Chair → `/compartment-chair`

## Shell chrome (every page)

- **Header**: logo “Waka Waka” · nav Furniture / Index / Studio · location + live clock · menu dot
- **Fullscreen menu**: overlay nav with GSAP slide-in wrappers
- **Footer**: “functional objects” · links (iko Iko, Instagram, email) · phone · location · ©2026

## Rebuild plan (modules)

| # | Module | Deliverable | Status |
|---|---|---|---|
| M0 | Scout + Plato dumps | `wakawaka-restore/analysis/*`, `scratch/plato_*.json` | DONE |
| M1 | Static assets | fonts + CSS tokens into `public/wakawaka-static` | DONE |
| M2 | Shell | `WakaLayout` header/footer/menu | DONE |
| M3 | Home | giant type + featured grids + credit | DONE (GSAP intro) |
| M4 | Studio / Catalogue / Furniture | content pages from Plato | DONE |
| M5 | Product detail | `/{slug}` | DONE (Canvas2D strip+zoom) |
| M6 | Visual QA | browser vs production screenshots | DONE v1 |
| M7 | Home+Product motion polish | GSAP intro + canvas zoom | DONE |

## Honest gaps

- Product WebGL HD/SD shader path — Canvas2D equivalent strip/zoom instead.
- Non-chair furniture PDPs not yet dumped (grid links may 404 outside chair collection).
- Sanity image CDN used as-is (hotlink) for fidelity; optional local mirror later.

## Entry points

- App routes under `/wakawaka/*` in `apps/h5/src/App.tsx`
- Menu: `/` → **Waka Waka**
- Analysis trail: `wakawaka-restore/analysis/00` … `04`