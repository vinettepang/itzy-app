# Haoqi.design — Extracted Tokens & Structure

## Fonts (@font-face: 0)

```css

```

## Token blocks (:root / @theme / .dark)

```css
:root {
  --lightningcss-light:initial;
  --lightningcss-dark: ;
  color-scheme:light;
  --label:0,0,0;
  --label-d:54,54,48;
  --background-deep:251,250,244;
  --label-1:rgba(var(--label),1);
  --label-2:rgba(var(--label-d),.6);
  --label-3:rgba(var(--label-d),.32);
  --label-4:rgba(var(--label-d),.18);
  --line:rgba(var(--label-d),.1);
  --background-1:rgb(var(--background-deep));
  --background-elevated:#efede7;
  --cubic-66:cubic-bezier(.66,0,.01,1);
  --selection-bg:#c0fe04;
  --code-comment:rgba(var(--label-d),.45);
  --code-string:#00784a;
  --code-number:#8a6a00;
  --code-keyword:#5e53e3;
  --code-function:#0077bc;
  --code-tag:#c0434c;
  --code-operator:rgba(var(--label-d),.75)
}

:root {
  --selection-bg:lab(92.9242% -39.8464 87.367);
  --code-string:lab(43.8263% -47.6118 18.596);
  --code-number:lab(46.7992% 8.99872 72.9973);
  --code-keyword:lab(43.3789% 36.2819 -73.3524);
  --code-function:lab(47.3165% -8.24019 -45.3882);
  --code-tag:lab(47.2741% 51.266 23.7532)
}

.dark {
  --lightningcss-light: ;
  --lightningcss-dark:initial;
  color-scheme:dark;
  --label:255,255,255;
  --label-d:230,232,232;
  --background-deep:15,17,17;
  --label-1:rgba(var(--label),1);
  --label-2:rgba(var(--label-d),.6);
  --label-3:rgba(var(--label-d),.32);
  --label-4:rgba(var(--label-d),.16);
  --line:rgba(var(--label-d),.08);
  --background-1:rgb(var(--background-deep));
  --background-elevated:#191b1b;
  --code-comment:rgba(var(--label-d),.5);
  --code-string:#80daac;
  --code-number:#ebc669;
  --code-keyword:#afb6ff;
  --code-function:#8dcbff;
  --code-tag:#ffa3a3;
  --code-operator:rgba(var(--label-d),.85)
}

.dark {
  --code-string:lab(80.5863% -36.0539 14.2351);
  --code-number:lab(81.7507% 5.58251 51.1676);
  --code-keyword:lab(74.3615% 26.3244 -70.4223);
  --code-function:lab(78.8788% -11.9607 -42.8116);
  --code-tag:lab(76.4079% 47.9123 21.2271)
}
```

## Color-like var defs (28)

```
--tw-ring-offset-color:#fff
--color-black:#000
--color-white:#fff
--label-1:rgba(var(--label),1)
--label-2:rgba(var(--label-d),.6)
--label-3:rgba(var(--label-d),.32)
--label-4:rgba(var(--label-d),.18)
--line:rgba(var(--label-d),.1)
--background-1:rgb(var(--background-deep))
--background-elevated:#efede7
--selection-bg:#c0fe04
--code-comment:rgba(var(--label-d),.45)
--code-string:#00784a
--code-number:#8a6a00
--code-keyword:#5e53e3
--code-function:#0077bc
--code-tag:#c0434c
--code-operator:rgba(var(--label-d),.75)}@supports (color:lab(0% 0 0)){:root{--selection-bg:lab(92.9242% -39.8464 87.367)
--label-4:rgba(var(--label-d),.16)
--line:rgba(var(--label-d),.08)
--background-elevated:#191b1b
--code-comment:rgba(var(--label-d),.5)
--code-string:#80daac
--code-number:#ebc669
--code-keyword:#afb6ff
--code-function:#8dcbff
--code-tag:#ffa3a3
--code-operator:rgba(var(--label-d),.85)}@supports (color:lab(0% 0 0)){.dark{--code-string:lab(80.5863% -36.0539 14.2351)
```

## Meta tags

```html
<meta charSet="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta name="description" content="Digital Product Designer &amp; Builder © 2026"/>
```

## Link tags

```html
<link rel="stylesheet" href="/_next/static/chunks/635eb04122aa774f.css" data-precedence="next"/>
<link rel="preload" as="script" fetchPriority="low" href="/_next/static/chunks/56b0d8f9f2c1e441.js"/>
<link rel="icon" href="/icon.svg?icon.f022d428.svg" sizes="any" type="image/svg+xml"/>
<link rel="apple-touch-icon" href="/apple-icon.png?apple-icon.179f0bdd.png" sizes="512x512" type="image/png"/>
```

## Internal hrefs

/_next/static/chunks/635eb04122aa774f.css
/_next/static/chunks/56b0d8f9f2c1e441.js
/icon.svg?icon.f022d428.svg
/apple-icon.png?apple-icon.179f0bdd.png
/
/reunimos
/inspire_mono
/wasm_design_utils
/adrive
/shore_icon
/teambition
mailto:curiosity.wen@gmail.com

## Body text (stripped)

HAOQI©2026 haoqi .design Work Contact THEME[A] SOUND[|] --:-- GMT+8 CN --:-- 0001 X 0001 Y Design & Engineering Thinking in systems. Designing with care. I'm Haoqi Wen, leading Design Engineering and AI exploration at ■ ■ ■ ■ ■ ■ , engineering, and AI at scale. Outside work, I build design tools for team efficiency. I bring craft & taste to digital work I explore how to shape AI-era workflows with craft and taste, building the next generation of digital products. I’m building reunimos™ , and previously worked on Alibaba aDrive , Teambition , and 100offer. Coding Project Reunimos™ 2024-2026 Coding Project Inspire Mono 2025 Coding Project Wasm design utils 2025 Coding Project VectorSymbols 2023 tools ↗ Coding Project DarkSide 2021 tools ↗ aDrive 阿里云盘 2020-2022 Shore Icon 2022 Teambition 2018-2020 FoF: See Hear Touch 2022 event ↗ FoF: Design System 2021 event ↗ Innovate with purpose Let's Create Something Extraordinary curiosity.wen@gmail.com Twitter/X Figma GitHub
