# 01 Shell — header / footer / tokens

## Header (SOURCE · live DOM)

```
header.fixed.top-0.left-0.w-full.z-10100
  h-[36px] md:h-[34px] bg-white
  div.flex.justify-between.items-center.p-2.5
    a[href=/] → STAGECREW wordmark SVG (93×12)
    nav:
      Work → /
      Info → /info
      Backstage → /backstage
      Insta → https://www.instagram.com/stagecrew.studio
      Email → mailto:office@stagecrew.studio
```

- Logo paths use `fill-main` / `group-hover:fill-hover`
- Active route styling: observe in CSS (PARTIAL — likely underline or weight)

## Footer (SOURCE · CMS `global_footer`)

- `Text`: HTML studio one-liner
- `disclaimer`: “We do not use AI…”
- `contact_info`: HTML with mailto
- `bottom_labels`: `[{label:"SC"},{label:"WW"}]`

## Tokens (SOURCE)

| Token | Value |
|---|---|
| `--bg` | `#fbfbfb` |
| `--fg` | `#202020` |
| Font body | Baikal Book |
| Font regular/UI | Baikal Regular |
| Font files | `/fonts/Baikal-Book.woff2`, `/fonts/Baikal-Regular.woff2` |

## Media URL helpers (SOURCE)

- CMS asset: `https://cms.stagecrew.studio/assets/{uuid}`
- Bunny: `https://stagecrew-media.b-cdn.net/{uuid}.jpg?width=&format=webp&quality=75`
- Vimeo: use `cover.vimeo_url` + `vimeo_thumb` from Directus file fields

## Rebuild notes

Mount under h5 as `/stagecrew` with base path rewriting for links.
Keep logo SVG inline (copied from prod).
