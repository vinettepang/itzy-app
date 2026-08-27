# 01 Shell & tokens

## CSS (SOURCE · `d8c3ce809391817c.css`)

Copied to h5 as `apps/h5/src/pages/yc/yc.css`.

Key tokens:
- `--page: #2e1f15`
- `--paper-light: 244,241,219`
- `--ticket-ink: #4a301d`
- Font: Martian Mono / Geist Mono
- BG image: `https://bookface-static.ycombinator.com/vite/assets/page-bg-C27Z9D2J.png`

## Layout

`.yc-root` → `.page-background` + `.back-link` + `.page-shell` → `.ticket-stage` → `.ticket-machine` + `.ticket-actions`

Machine size: `min(920px, 100vw-24px)` × `min(570px, 100dvh-210px)` min-height 490px.
