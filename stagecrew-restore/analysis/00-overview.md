# STAGECREW restore — 00 Overview

> Target: https://stagecrew.studio/  
> Date: 2026-08-04  
> Fact labels: **SOURCE** = verified from prod/CMS · **PARTIAL** · **GUESS**

## What this site is

Personal/studio portfolio for **STAGECREW** — compact creative studio site. Home = Work index.

## Stack (SOURCE)

| Layer | Technology | Evidence |
|---|---|---|
| Framework | **Nuxt 3** (Vue) | `#__nuxt`, `__NUXT_DATA__`, `/_nuxt/*`, `/_payload.json` |
| CMS | **Directus** at `cms.stagecrew.studio` | `X-Powered-By: Directus`, public `/items/*` |
| Media CDN | Bunny `stagecrew-media.b-cdn.net` | Preloads / img `srcset` |
| Video | Vimeo progressive MP4 (+ Directus `vimeo_*` fields) | `<video src="player.vimeo.com/...">` |
| Scroll | **Lenis** | `html.lenis`, `window.lenis` |
| CSS | Tailwind-style utilities (Nuxt CSS chunks) | Header `h-[36px]`, `aspect-[5/3.5]` |
| Fonts | **Baikal Book** / **Baikal Regular** | `@font-face` → `/fonts/Baikal-*.woff2` |
| WebGL / shaders | **None on main surfaces** | No `<canvas>`, no THREE/GSAP globals |

→ **web-shader-extractor is NOT needed** for this site (DOM/CSS/video clone).

## Routes (SOURCE)

| Path | Page | Notes |
|---|---|---|
| `/` | Work index | Same as “Work” nav |
| `/info` | Info / about | Intro, pitch, mark, lists, media |
| `/backstage` | Backstage | Studio text page |
| `/work/:slug` | Project detail | Gallery + copy + crew |

### Project slugs (SOURCE · CMS)

| slug | title | coming soon |
|---|---|---|
| `hall-gad-architects` | Hall Gad Architects | no |
| `aura` | AURA | no |
| `the-hall` | The Hall | no |
| `innerstate` | INNERSTATE | no |
| `craftland` | Craftland | **yes** |
| `last-future` | Benjamin Park | **yes** |
| `new-province` | New Province | **yes** |

## Visual DNA (SOURCE)

- Background: `#fbfbfb` ≈ `rgb(251,251,251)`
- Text: `#202020` ≈ `rgb(32,32,32)`
- Fixed white header ~34–36px
- Wordmark SVG “STAGECREW”
- Work grid: cards `aspect-[5/3.5]`, hover shows title + areas
- Coming-soon cards: reduced opacity / not linked (or non-navigating)
- Footer: studio blurb, AI disclaimer, contact, `SC` / `WW` labels

## Data sources for rebuild

1. **Primary:** Directus REST dumps under `scratch/cms-*.json` (public, no auth)
2. **Secondary:** Nuxt `_payload.json` decoded → `scratch/payload-*.decoded.json`
3. **Assets:** hotlink CDN / `cms.stagecrew.studio/assets/{id}` (or Bunny)

## Rebuild plan (modules)

1. **Shell** — layout, header, footer, fonts, tokens → `01-shell.md`
2. **Work index** — project grid + media → `02-work.md`
3. **Info / Backstage** → `03-info-backstage.md`
4. **Project detail** → `04-project.md`
5. **Motion** — Lenis + hover/transitions (no WebGL) → `05-motion.md`
6. **h5 mount** — `/stagecrew/*` + Menu group → implement in `apps/h5`

## Honest gaps

- Exact Tailwind theme tokens / hover easing: extract from CSS chunks (PARTIAL until CSS fully mapped)
- Nuxt page transitions / overlay `.main-overlay`: observe timing (PARTIAL)
- Private CMS fields if any: public API returned full project gallery for Aura (SOURCE OK so far)
