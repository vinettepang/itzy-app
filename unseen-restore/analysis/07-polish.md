# M7 — Polish (audio / mute / shell)

## SOURCE

- Howler sprite `resources/assets/audio/audio.webm`
- Enter / Enter without audio · mute toggle
- Dom2Webgl “View our work” button (Deferred · DOM CTA on Home)

## Local

| 项 | 实现 | 标签 |
|---|---|---|
| Ambient loop + sprites | `audio/studioSound.ts` · HTML Audio seek (Howler sprite map) | SOURCE-shaped |
| Mute toggle | header when entered with audio | SOURCE UX |
| Hero CTA | `HomePage` DOM type + CTA / DomParallax | PARTIAL Dom2Webgl |

## Menu socials

Twitter / Instagram / LinkedIn / Dribbble / Behance — wired in `UnseenStudioLayout.tsx` (SOURCE).

## Remaining nice-to-haves

- Custom cursor, ASScroll, EffectComposer SavePass (true dual-RT)
- Dom2Webgl true HTML→WebGL mesh / Contact 3D panels
- eyes-* bitmap sequence (SVG blink idle is PARTIAL)
- True Howler dependency / world-loop continuous crossfade

Route slices + SavePass-like dual veil + grain `uFlash`: PARTIAL in `RouteTransition` / `createGrainPass`.
Grass RawShader + packed water atlas + audio sprites: wired.
