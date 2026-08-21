# wakawaka.world — 04 Visual QA

> 2026-07-31 · local `http://127.0.0.1:5177/wakawaka` vs `https://wakawaka.world`

## Verdict

Core shell + home + studio + catalogue + furniture grid + product detail are visually aligned enough for restore v1. Remaining gaps are motion systems (home layout morph, product canvas).

## Checklist

| Route | Shell | Content | Typography | Images | Notes |
|---|---|---|---|---|---|
| `/` | OK | OK | OK | OK | Crossfade PARTIAL |
| `/studio` | OK | OK | OK | OK | Press + profile |
| `/catalogue` | OK | OK | OK | n/a | Text index MATCH |
| `/furniture/chair-collection` | OK | OK | OK | OK | Filters chrome OK; multi-category data PARTIAL |
| `/cylinder-back` | OK | OK | OK | OK | No canvas; still+info |

## How to run

```bash
cd apps/h5
npm run dev
# open /wakawaka
```

Menu entry also on `/` → Waka Waka.
