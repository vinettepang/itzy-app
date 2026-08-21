# wakawaka.world — 03 Content pages

> Status: DONE (DOM-aligned) · 2026-07-31

## Studio `/wakawaka/studio`

Prod DOM: `#about > .grid` with `about__header | about__contacts | about__profile | about__press`.

Press fields from Plato: `articleTitle` / `articleOrigin` / `articleLink`.

## Catalogue `/wakawaka/catalogue`

**Not** an image grid — text index:

`catalogue__list-item` → index · name · material · dimensions

Headline: `Catalogue` / `FW/20`

## Furniture `/wakawaka/furniture/:category`

Page id is `#shop` (not furniture).

Filters: `filters-container` + `filters__nav-item` comma list.

Grid: `grid__item.child-nN` with content above asset.

Category filtering: `furniture.json.byCategory` from Plato — All / chair / dining / … each show their item sets (deduped on All).

Product PDP only slimmed for chair-collection slugs; other furniture links may 404 until more Plato product dumps are added.

## Product `/wakawaka/:slug`

Prod uses WebGL2 canvas sequence. Rebuild (`ProductCanvas.tsx`):

- Horizontal strip auto-scroll at `0.8vh` image height
- Click toggles zoom (full viewport width + vertical scroll) via GSAP 1.6s
- Pause / LARGER·SMALLER cursor / wheel scrub
- Info panel unchanged

WebGL HD/SD shader blend = not ported (Canvas2D fidelity).
