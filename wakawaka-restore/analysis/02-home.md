# wakawaka.world — 02 Home

> Status: DONE (visual pass) · PARTIAL motion · 2026-07-31

## Markup

- `#homepage.page-wrapper.layout-N`
- Giant `.waka` / `.waka--bottom` type (Waka Sans 700, ~38.9vw)
- Credit link · mark SVG · featured grids

## Data

`featuredChairs.json` — 3 chairs with dual images + palette colors from Plato.

## Motion (DONE)

Production does **not** timed-cycle chairs. Rebuild now matches:

1. Random featured chair + random layout `0|1|2`
2. GSAP intro (`perspective` / Z pull + grid y-slide)

See `05-motion.md`.

## QA vs prod (1440×900)

| Check | Result |
|---|---|
| Type size 560px / height 448 | MATCH |
| Header nav + LA clock | MATCH |
| Featured chair image | MATCH (CDN) |
| Fonts Waka Sans loaded | MATCH |
| Grid crossfade timing | PARTIAL |
