# 04 Implementation — h5 `/yc`

## Mount

- Route: `/yc` → `apps/h5/src/pages/yc/YcPage.tsx`
- Menu group: **YC Ticket**

## Files

| File | Role |
|---|---|
| `YcPage.tsx` | Shell, MeshGradient, FlutedGlass, tilt, actions |
| `TicketRoll.tsx` | Three.js roll + tear VFX |
| `useTicketMachine.ts` | Phase machine, drag, Web Audio |
| `TicketOverlay.tsx` | SVG copy |
| `PaperNoise.tsx` | Grain canvas |
| `exportTicket.ts` | PNG composite export |
| `splitName.ts` | Name line splitter |
| `yc.css` | Prod CSS port |

## Deps

- `three` (existing)
- `@paper-design/shaders-react@0.0.80`

## Notes

- FlutedGlass: SOURCE omitted `image`; restore uses orange SVG data-URL so stub glass still samples ticket hues.
- Back link → `/menu` (prod was self `/yc`).
- Default name: `Anthony Ung`.
