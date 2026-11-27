/**
 * 从镜像 __data.json / index.html 导出 React 站用的 content.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../public/felixpeault');
const out = path.resolve(__dirname, '../src/pages/felixpeault/data/content.json');

const PROJECT = 'njs3gbw1';
const DATASET = 'production';

function sanityUrl(ref, w = 800) {
  if (!ref || !ref.startsWith('image-')) return '';
  const id = ref.replace(/^image-/, '').replace(/-jpg$/, '.jpg').replace(/-png$/, '.png');
  return `https://cdn.sanity.io/images/${PROJECT}/${DATASET}/${id}?auto=format&fit=max&q=85&w=${w}`;
}

function extractSeries(raw) {
  const thumbRefs = [...raw.matchAll(/image-[a-f0-9]+-\d+x\d+-jpg/g)].map((m) => m[0]);
  const seriesThumbs = thumbRefs.slice(1, 6);

  const items = [];
  const serieRe =
    /"(\d{1,3} \d{1,3} \d{1,3})","(\d{1,3} \d{1,3} \d{1,3})","([^"]+)","([a-z0-9-]+)"/g;
  for (const m of raw.matchAll(serieRe)) {
    const [, end, start, name, slug] = m;
    if (!slug.includes('-')) continue;
    if (items.some((i) => i.slug === slug)) continue;
    const thumbRef = seriesThumbs[items.length];
    items.push({
      name,
      slug,
      gradient: { start, end },
      ...(thumbRef ? { thumbnail: sanityUrl(thumbRef, 1200) } : {}),
    });
  }
  if (items.length) return items.slice(0, 12);

  const pairs = [...raw.matchAll(/"([A-Za-zÀ-ÿ][^"]{1,48})","([a-z0-9-]{3,48})"/g)];
  for (const m of pairs) {
    const name = m[1];
    const slug = m[2];
    if (slug.includes('-') && !['reference', 'normal', 'block', 'span', 'link', 'image'].includes(slug)) {
      if (items.some((i) => i.slug === slug)) continue;
      if (['en', 'fr', 'email', 'instagram'].includes(slug)) continue;
      items.push({ name, slug });
    }
  }
  return items.slice(0, 12);
}

function extractImageRefs(raw) {
  return [...raw.matchAll(/image-[a-f0-9]+-\d+x\d+-jpg/g)].map((m) => m[0]);
}

const seriesRaw = fs.readFileSync(path.join(root, 'series/__data.json'), 'utf8');
const indexCandidates = [
  path.join(root, 'index.html'),
  path.join(root, '_archive-svelte-index.html'),
  path.join(root, 'fr/index.html'),
];
const indexPath = indexCandidates.find((p) => fs.existsSync(p));
const indexHtml = indexPath ? fs.readFileSync(indexPath, 'utf8') : '';

const heroTextMatch = indexHtml.match(
  /Observations of a world in motion[^<]{0,200}Félix Péault/,
);
const heroText =
  heroTextMatch?.[0]?.replace(/\s+/g, ' ').trim() ||
  'Observations of a world in motion and a quest for unordinary moments within the ordinary, captured by Félix Péault.';

const imgSrcs = [...indexHtml.matchAll(/src="(https:\/\/cdn\.sanity\.io[^"]+)"/g)].map((m) =>
  m[1].replace(/&amp;/g, '&'),
);
const homepagePhotos = imgSrcs.slice(0, 24).map((src, i) => ({
  src,
  alt: `Photo ${i + 1}`,
}));

const bioMatch = seriesRaw.match(
  /Félix Péault is an art director[\s\S]{0,280}everyday scenes\./,
);
const bio = bioMatch?.[0] || '';

const shortBioMatch = seriesRaw.match(
  /Photographer, art director and designer working worldwide\./,
);
const shortBio = shortBioMatch?.[0] || '';

const yearRe = /"(\d{4}(?:-\d{2})?)","(\d{1,3} \d{1,3} \d{1,3})"/g;
const years = [...seriesRaw.matchAll(yearRe)].map((m) => m[1]);

const content = {
  seo: {
    title: 'Félix Péault • Photographer uncovering the unordinary',
    description:
      'Observations of a world in motion and a quest for unordinary moments within the ordinary.',
  },
  heroText,
  bio,
  infoBlocks: [
    {
      title: 'Mediums',
      text: 'Street photography\nLifestyle\nGraphic\nNature',
    },
    {
      title: 'Available for',
      text: 'Reportage, editorial, travel, architecture, commissions and collaborations',
    },
  ],
  contact: {
    email: { label: 'Email', address: 'snap@felixpeault.com' },
    instagram: {
      label: 'Instagram',
      handle: '@felixpeault',
      url: 'https://www.instagram.com/felixpeault',
    },
  },
  shortBio,
  series: extractSeries(seriesRaw).map((item, i) => ({
    ...item,
    year: years[i] ?? item.year,
  })),
  homepagePhotos,
  journeysNote:
    'Journeys grid uses the same Sanity CDN as the mirror; replace URLs in content.json for full offline.',
};

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(content, null, 2));
console.log('wrote', out, {
  series: content.series.length,
  photos: content.homepagePhotos.length,
});
