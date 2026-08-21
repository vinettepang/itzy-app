# 06 Implementation status

## Mounted in h5

| Route | Component |
|---|---|
| `/stagecrew` | Work index — vertical auto-scroll carousel |
| `/stagecrew/info` | Info (numbered sections + pitch lists + mark) |
| `/stagecrew/backstage` | Backstage intro + 3-column masonry |
| `/stagecrew/work/:slug` | Project (sticky info + gallery grid) |

Data: `apps/h5/src/pages/stagecrew/data/site.json` (+ `projects.json`) from Directus / Nuxt payloads.

## Done vs prod

| Item | Status |
|---|---|
| Tokens / Baikal fonts / colors | PASS |
| SVG wordmark | PASS |
| Header nav + active grey | PASS |
| Work vertical carousel physics | PASS (36px/s, lerp 0.25, drag×2.5, wheel×1.5, ×3 loop) |
| Active title + areas / Coming Soon | PASS |
| Intro bottom-right | PASS |
| No footer on Work | PASS |
| Bunny `.jpg` media URLs | PASS (StagecrewMedia normalize + data patch) |
| Info numbered layout | PASS (approx) |
| Backstage 3-col items | PASS |
| Project sticky info + gallery | PASS |
| Project fixed masthead title | PASS |
| Page transition overlay | SKIPPED (cosmetic) |

## Dev

```bash
cd apps/h5 && npm run dev -- --host 127.0.0.1 --port 5181
```

Open `/stagecrew`, compare to https://stagecrew.studio/
