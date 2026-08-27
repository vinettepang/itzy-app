# 02 Ticket artwork & shaders

## MeshGradient (SOURCE)

```
colors: ["#FF6A00","#FC5E10","#FF8A30","#FFCB8E","#FFE4C2"]
distortion: 0.6
swirl: 0.3
speed: reducedMotion ? 0 : 1.8
grainMixer: 0
grainOverlay: 0
preserveDrawingBuffer: true
```

Library: `@paper-design/shaders-react` → `MeshGradient`

## FlutedGlass (SOURCE)

```
size: 0.86
shadows: 0
highlights: 0
angle: 0
distortion: 0.39
shift: 0
stretch: 0
blur: 0
edges: 0.25
margin: 0
grainMixer: 0
grainOverlay: 0
shape: "lines"
distortionShape: "prism"
fit: "cover"
animated offsets (when motion ok):
  offsetX: 0.15 + 0.15*cos(0.35*t)
  offsetY: -0.21 + 0.2*sin(0.5*t)
  scale: 2.2 + 0.3*sin(0.3*t)
```

Layer CSS: right 38% stub, `border-radius: 0 13px 13px 0`.

## Paper noise (SOURCE)

800×400 canvas, random grayscale pixels, opacity 0.4, mix-blend-mode overlay.

## SVG overlay (SOURCE)

viewBox 0 0 520 280 — name lines + ADMIT ONE + 2026 stub.
