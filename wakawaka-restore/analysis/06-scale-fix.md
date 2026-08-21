# wakawaka — 06 Scale fix

## Root cause

h5 global `index.css` sets `:root { font: 18px/... }`.  
`:root` specificity **(0,1,0)** beats production `html { font-size: 62.5% }` **(0,0,1)**.

Result: rem base stayed 18px → UI ~1.8× oversized (nav 43px vs 24px, body 25px vs 14px).

## Fix

`html.is-wakawaka { font-size: 10px !important; }` (≡ 62.5% of 16px UA default)

Mounted in `WakaLayout`. Also neutralize global `h1/h2` color/margin without `!important` on font-size (so `.waka` vw sizing still wins).

## Verified @ 1440×900

| Token | Prod | Local after |
|---|---|---|
| html | ~12/10 | 10px |
| body | 14px | 14px |
| nav | 24px | 24px |
| header | 14px | 14px |
| .waka | 560px / h448 | 560px / h448 |
