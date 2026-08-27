# 00 Overview — anthnyung.com/yc

## Product

Interactive **Startup School 2026** admission ticket for **Anthony Ung**.
Single route: `https://anthnyung.com/yc`

## Stack (SOURCE)

| Layer | Tech |
|---|---|
| Framework | Next.js App Router (`/_next/...`, `app/yc/page`) |
| 3D roll | Three.js (`WebGLRenderer`, cylinder ticket roll on `canvas.roll-canvas`) |
| Ticket face shaders | `@paper-design/shaders` via React wrappers (`data-paper-shader`) |
| Mesh | MeshGradient — colors `#FF6A00 #FC5E10 #FF8A30 #FFCB8E #FFE4C2`, distortion `.6`, swirl `.3`, speed `1.8` |
| Stub glass | FlutedGlass — `shape:"lines"`, `distortionShape:"prism"`, size `.86`, distortion `.39`, edges `.25` |
| Noise | Canvas2D random grayscale overlay `.paper-noise` |
| Typography | Martian Mono / Geist Mono (Google Fonts) |
| BG | YC bookface static `page-bg-C27Z9D2J.png` |
| Export | `toBlob` download PNG of `#ticket-artwork` |

## Interaction phases (SOURCE)

`attached → perforation → chopping → tearing → holding → settling → detached`

- Buttons: **TEAR OFF TICKET** / **ROLL ANOTHER**, **SAVE** (enabled when detached)
- Callout when detached: “TICKET SECURED / Don’t lose it…”
- Pointer drag on ticket while attached (tension)

## Rebuild plan (h5)

Mount at `/yc` under React Router.
Reuse CSS tokens from prod `d8c3ce809391817c.css`.
Depend on `three` + `@paper-design/shaders-react`.

## No WebGL mystery

Paper Shaders + Three are identified — full `/web-shader-extractor` deep capture optional; prefer library APIs with extracted uniforms (SOURCE).
