# Prod Homepage intro — extracted from Homepage.18a30190782f06d8a84f.js

## Sequence

1. **setupDOM** (base): `gsap.set(page, { autoAlpha: 0 })`
2. **calculateZ** (first visit only):
   - `html.is-intro`, overflow/pointer-events lock
   - `body`: overflow hidden, **perspective 2000px**, origin `50% 0%`, height 100%
   - `site`: background transparent, overflow hidden
   - `.main-background` display block (inside `.site`)
   - `.label-global` / `.logo-global` display block (siblings of `.site`)
   - footer / credit / logo opacity 0
   - Measure `pageH = site.offsetHeight` (natural height — not viewport-locked)
   - `ratio = mobile ? 1100/1800 : 1500/1800`
   - `scale = pageH / ratio / vh`, `yOffset = abs((vh*ratio - vh)/2)`, `z = 2000 * (1 - scale)`
   - set site `{ z, y: yOffset*scale }`, bg/wrapper `{ y: pageH }`, grid `{ y: -pageH }`
   - Build paused `TL.showPoster`
3. **showComponent → TL.show**: page autoAlpha 0→1, 0.5s, cubic.out → `onShown`
4. **onShown**: `setTimeout(play showPoster, 500)`
5. **showPoster**:
   - page autoAlpha 1, 0.5s cubic.out (usually noop)
   - bg + wrapper + grid y→0, 1.2s power3.inOut @0
   - footer/credit/logo opacity 1, 0.5s quart.out @1.2
   - grid onComplete → `onFirstShownComplete`
6. **onFirstShownComplete**: clear willChange; after hero images resolve:
   - `gsap.to(site, { z:0, y:0, duration:1.5, ease:power4.inOut, delay:1.5, clearProps:all })`
   - cleanup intro styles, remove `is-intro`

## DOM extras

```
.site
  …header, #content, footer
  span.main-background
.logo-global (mark SVG)
p.label-global (studio blurb)
```
