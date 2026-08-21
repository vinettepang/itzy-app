# wakawaka — 05 Motion (home + product)

## Homepage (SOURCE from `Homepage.*.js`)

**Not** a timed chair carousel. On load:

1. Pick random featured chair index
2. Pick random layout `0|1|2` via `generateRandomGrid`
3. `layout-0`: featured full-bleed, side hidden, only img[0] active
4. `layout-1` / `layout-2`: featured ~66% + side ~29%
5. GSAP intro (`calculateZ` / `showPoster`):
   - `body` perspective `2000px`
   - site translated on Z then eased to 0
   - `grid__animation-wrapper` / grid / main-background y-slide in 1.2s
6. Markup note: `grid__item-content` lives on the **side** link, not featured

## Product (SOURCE from `Product.*.js`)

WebGL2 canvas (`#c`) scene:

- Default view: horizontal strip of gallery images at `0.8 * innerHeight`, auto-scroll wrapping
- Zoom view: image expands to viewport width, vertical auto-scroll
- GSAP `zoom` / `unZoom` duration 1.6s power3.inOut
- Cursor labels LARGER / SMALLER; Pause freezes auto-scroll
- HD/SD texture fade is presentation detail — Canvas2D strip + zoom is acceptable fidelity

## Rebuild plan

- Home: GSAP intro + random layout (remove interval swap)
- Product: `ProductCanvas` Canvas2D strip with zoom/pause/wheel
