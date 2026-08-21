import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const p = JSON.parse(fs.readFileSync(path.join(root, 'wakawaka-restore/scratch/plato_furniture.json'), 'utf8'));
const sd = p.serverData || p;
const filters = sd.filters || [];

function imgUrl(im) {
  if (!im) return null;
  if (typeof im === 'string') return im;
  const asset = im.asset || im;
  const base = asset.url || im.url;
  if (!base) return null;
  return `${base}?w=800&fit=max&auto=format&q=85`;
}

function colorOf(im) {
  return (
    im?.asset?.metadata?.palette?.muted?.background ||
    im?.asset?.metadata?.palette?.dominant?.background ||
    im?.metadata?.palette?.muted?.background ||
    '#c4c4bc'
  );
}

function slimItem(item, i) {
  const image =
    item.featured_image_1 ||
    item.featuredImage ||
    item.image ||
    item.mainImage ||
    item.thumbnail;
  const slug = typeof item.slug === 'object' ? item.slug?.current : item.slug;
  const nRaw = item.index ?? item.chairNumber ?? item.number ?? i + 1;
  const n = String(nRaw).replace(/\D/g, '').padStart(4, '0');
  return {
    n,
    name: item.name || item.title || '',
    slug: slug || '',
    image: imgUrl(image),
    color: colorOf(image),
  };
}

const out = {
  filters: filters.map((f) => ({
    title: f.label || f.title || f.slug,
    slug: f.slug,
    count: f.filtersLength ?? f.items?.length ?? null,
  })),
  byCategory: Object.fromEntries(
    filters.map((f) => [f.slug, (f.items || []).map((item, i) => slimItem(item, i))]),
  ),
  chairs: (filters.find((f) => f.slug === 'chair-collection')?.items || []).map((item, i) =>
    slimItem(item, i),
  ),
};

const dest = path.join(root, 'apps/h5/src/pages/wakawaka/data/furniture.json');
fs.writeFileSync(dest, JSON.stringify(out, null, 2));
console.log(
  'filters',
  out.filters.length,
  'chair',
  out.chairs.length,
  'dining',
  out.byCategory['dining-meeting-tables']?.length,
);
