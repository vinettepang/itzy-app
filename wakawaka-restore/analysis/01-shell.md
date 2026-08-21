# wakawaka.world — 01 Shell

> Status: DONE (scaffold) · 2026-07-31

## Deliverable

`apps/h5/src/pages/wakawaka/WakaLayout.tsx` + `WakaMark.tsx` + prod CSS remount.

## Shell chrome (SOURCE)

| Piece | Implementation |
|---|---|
| Header | Logo · Furniture/Index/Studio · LA clock · menu dot |
| Fullscreen menu | Overlay with nav + mark; open via `.is-open` / `.is-menu-open` |
| Footer | functional objects · location/phone · links · © |
| HTML attrs | `type=homepage`, `location=*`, `.is-homepage` for home CSS hooks |
| Fonts | `/wakawaka-static/fonts/*.woff2` remapped from prod hashed assets |

## Critical rebuild note

Prod CSS sets `.page-wrapper{opacity:0;visibility:hidden}` until intro JS. Override in `wakawaka.css` with `!important` reveal so pages are visible without the original bundle.

## Routes wired

`/wakawaka`, `/wakawaka/studio`, `/wakawaka/catalogue`, `/wakawaka/furniture`, `/wakawaka/furniture/:category`, `/wakawaka/:slug`
