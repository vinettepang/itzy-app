# 02 Work index

## Content (SOURCE · payload + CMS)

- Intro HTML from `page_work.text`
- Projects list sorted by `sort`
- Each card: cover (image or video), title, areas[], `is_coming_soon`

## Layout (SOURCE · DOM)

- Grid of links `a[href=/work/:slug]`
- Media wrapper: `aspect-[5/3.5] relative overflow-hidden media-divider bg-media`
- Video: `playsinline autoplay muted loop` (assume muted — check)
- Image: `data-nuxt-img` with responsive sizes
- Cards appear **3×** in DOM (carousel/marquee duplication?) — home had each slug ×3  
  → **SOURCE**: duplicated nodes for infinite horizontal scroll / drag strip  
  → Rebuild: implement horizontal drag/scroll strip OR static responsive grid matching desktop screenshot

## Interaction (PARTIAL)

- Horizontal strip with drag (`draggable=false` on media, likely custom pointer drag)
- Hover reveals project title + area tags
- Coming soon: visible but not navigating / reduced opacity

## Data dump

See `scratch/cms-projects-full.json`, `scratch/payload-home.decoded.json`.
