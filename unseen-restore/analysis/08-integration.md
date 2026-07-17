# M8 — Integration

## Routes (`apps/h5`)

| Path | Page |
|---|---|
| `/unseen-studio` | Home + WebGL |
| `/unseen-studio/projects` | Projects filters/grid |
| `/unseen-studio/contact` | Contact + room/camera |
| `/unseen-studio/world` | World dark drag gallery |

Layout: `UnseenStudioLayout` keeps one `HomeCanvas` for home/contact/projects; World hides canvas.

## QA checklist

- [x] Loader progress → Enter / Enter without audio
- [x] Home scene water/grass/grain (prior session)
- [x] Contact Say hello + General tab (Bristol)
- [x] Projects filters (36 → Motion 5)
- [x] World drag strip (58) + details “IN THE CLOUDS”
- [ ] Sound on/off when Enter with audio (manual)

## Note

Local experiment `/unseen` (dolls) is **not** overwritten.
