# 07 Visual QA notes

## Work index — PASS (structure + media)

Vertical left strip (~41%), right meta + intro, auto-scroll, SVG logo. Bunny images require `.jpg` in path.

## Info — PASS (layout rewritten to numbered prod structure)

`1.Introduction` / hero 55% + mark 22% / `2.Pitch` rows / closing text.

## Backstage — PASS

Intro + 10 items in 3 columns from payload `backstage[]`.

## Project — PASS

Fixed title at `left: calc(33% + 8px)`, sticky Project Info, 2-col gallery with wide spans.

## Screenshots (playwright-mcp)

- `stagecrew-local-work4.png` / `stagecrew-prod-work3.png`
- `stagecrew-local-backstage2.png`
- `stagecrew-prod-aura.png`

## Known PARTIAL / SKIPPED

- Exact footer chrome on Info/Backstage (CMS text present; layout simplified)
- White route-transition overlay
- Gallery column-span heuristic (aspect > 1.35) vs CMS span field if any
