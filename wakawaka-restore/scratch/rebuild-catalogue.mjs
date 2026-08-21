import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const p = JSON.parse(fs.readFileSync(path.join(root, 'wakawaka-restore/scratch/plato_catalogue.json'), 'utf8'));
const sd = p.serverData || p;
const chairs = sd.allChair || [];
console.log('len', chairs.length, Object.keys(chairs[0] || {}));
console.log(JSON.stringify(chairs[0], null, 2).slice(0, 1500));

function dim(c) {
  return (
    c.dimensions ||
    c.dimension ||
    c.chairDimensions ||
    c.size ||
    (c.width && c.depth && c.height
      ? `(${c.width}x${c.depth}x${c.height}${c.seatHeight ? `x${c.seatHeight}` : ''})`
      : '')
  );
}

const slim = {
  title: String(sd.pageTitle || 'Catalogue\nFW/20')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<[^>]+>/g, ''),
  chairs: chairs.map((c, i) => ({
    n: String(c.chairNumber ?? c.number ?? c.n ?? i + 1).replace(/\D/g, '').padStart(4, '0'),
    name: c.name || c.title || '',
    slug: typeof c.slug === 'object' ? c.slug.current : c.slug || '',
    material: c.material || c.materials || c.wood || c.chairMaterial || c.primaryMaterial || 'Birch Wood',
    dimensions: dim(c),
  })),
};

fs.writeFileSync(path.join(root, 'apps/h5/src/pages/wakawaka/data/catalogue.json'), JSON.stringify(slim, null, 2));
console.log(slim.chairs.slice(0, 3));
