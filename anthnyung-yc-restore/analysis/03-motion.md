# 03 Roll + tear machine

## THREE roll (SOURCE · module 6750 `function h`)

- PerspectiveCamera(33), position (5.4, 6.1, 9.4), lookAt (-0.45, 0.82, 0.45)
- Hemisphere + Directional (shadows) + Point lights
- Cylinder roll with canvas-mapped ticket texture + end caps + spiral top
- Unrolled ribbon mesh driven by `progressRef.pull` and phase
- Detached ticket mesh + spark/chop VFX groups
- Animation loop reads phase from ref; tear sequence times from controller

## Tear phases (SOURCE)

| Phase | Duration cue |
|---|---|
| attached | idle / drag pull 0–1 |
| tension | start tear |
| perforation | 480ms — LINE IT UP… |
| chopping | 95ms — CHOP! + chop SFX |
| tearing | 130ms — TEARING… |
| holding | 240ms |
| settling | 620ms — settle SFX + materialize |
| detached | SAVE enabled, ROLL ANOTHER |

Drag: pointer capture, pull += dx/150, soft clamp past 0.74; release with velocity can auto-tear if pull≥0.92.

## Export (SOURCE)

Composite mesh/noise/glass canvases + SVG overlay → 1560×840 ticket → pad on #2E1F15 2160×1560 → PNG download.
