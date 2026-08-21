# 04 Project detail `/work/:slug`

## Fields (SOURCE · CMS `projects`)

- title, subtitle, slug, text (HTML)
- areas[] → areas_id.title
- cover (image/video file)
- gallery[] → directus_files_id (images/videos)
- crew[] (roles / people — verify in dump)
- is_coming_soon
- seo_settings

## Aura sample

- 9 gallery items
- Areas: Strategy, Creative Direction, Visual Identity, Packaging, Digital
- Cover: still image UUID `63bd4540-…`

## Layout (PARTIAL · screenshot)

- Title + subtitle / areas near top
- Body copy
- Vertical gallery of full-bleed / contained media
- Prev/next project nav (GUESS until confirmed in DOM)

## Dump

`scratch/project-aura.json` + per-slug `_payload.json` files.
