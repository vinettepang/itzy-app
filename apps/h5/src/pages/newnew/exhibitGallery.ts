const allEntries = Object.entries(
  import.meta.glob<string>("@/assets/*.{jpg,jpeg}", {
    eager: true,
    import: "default",
  }),
).sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }));

export type ExhibitImage = { src: string; alt: string };

/** 策展横条：去重相近文件名并限制数量，避免整包 assets 刷屏 */
export function getCuratedExhibitGallery(limit = 10): ExhibitImage[] {
  const seen = new Set<string>();
  const out: ExhibitImage[] = [];

  for (const [path, src] of allEntries) {
    const base =
      path
        .split("/")
        .pop()
        ?.replace(/\.[^.]+$/, "")
        ?.replace(/[-_]?\d+$/, "") ?? path;
    if (seen.has(base)) continue;
    seen.add(base);
    out.push({
      src,
      alt: base,
    });
    if (out.length >= limit) break;
  }

  return out;
}
