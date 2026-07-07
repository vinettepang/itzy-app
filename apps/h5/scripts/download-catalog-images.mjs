/**
 * Download catalog images from public merch listings into src/data/img/
 * Run: node scripts/download-catalog-images.mjs
 */
import { readFileSync, mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const catalogPath = join(root, 'src/data/wdzy_twinzy_catalog.json');
const imgDir = join(root, 'src/data/img');

// WDZY plush photos (eBay official merch listings)
const WDZY_CHARACTER_URLS = {
  HATT: 'https://i.ebayimg.com/images/g/2BoAAOSwaXtjWchy/s-l1600.jpg',
  LYA: 'https://i.ebayimg.com/images/g/2B0AAOSwaXtjWchz/s-l1600.jpg',
  TUK: 'https://i.ebayimg.com/images/g/gB8AAOSwe6JjWchz/s-l1600.jpg',
  CHUNG_EE: 'https://i.ebayimg.com/images/g/b4UAAOSwXZZjWchy/s-l1600.jpg',
  CABBIT: 'https://i.ebayimg.com/images/g/j54AAOSwUS1jWchw/s-l1600.jpg',
};

// TWINZY character art (JYP Japan official store)
const TWINZY_CHARACTER_URLS = {
  KKengEE:
    'https://cdn.shopify.com/s/files/1/0537/6835/6036/files/4570192825737_01_1d85fc09-5b44-4dfb-88e1-30237c3f79f9.jpg?v=1754586069',
  'Li-Li':
    'https://cdn.shopify.com/s/files/1/0537/6835/6036/files/4570192825744_01_d2e9871c-ef6c-40da-a35c-aefa2bbfd461.jpg?v=1754586072',
  RyuJJi:
    'https://cdn.shopify.com/s/files/1/0537/6835/6036/files/4570192825751_01_a70af6f4-f0c4-4bf7-abfe-5551a77a3980.jpg?v=1754586074',
  RyeoWoo:
    'https://cdn.shopify.com/s/files/1/0537/6835/6036/files/4570192825768_01_1_92a03b6d-493f-48e9-a8e3-c46612e837eb.jpg?v=1754586077',
  NAong: 'https://cdn.shopify.com/s/files/1/0537/6835/6036/files/4570192825775_01.jpg?v=1716522235',
};

function characterKey(member) {
  return member.character ?? member.twinzyName ?? '';
}

function resolveUrl(filename, member) {
  const key = characterKey(member);
  if (filename.startsWith('wdzy_')) return WDZY_CHARACTER_URLS[key] ?? null;
  if (filename.startsWith('twinzy_')) return TWINZY_CHARACTER_URLS[key] ?? null;
  return null;
}

async function download(url, dest) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(dest, buf);
  return buf.length;
}

async function main() {
  mkdirSync(imgDir, { recursive: true });
  const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
  const entries = [];

  for (const series of ['wdzy', 'twinzy']) {
    for (const product of catalog[series]) {
      for (const member of product.members) {
        entries.push({ filename: member.filename, member, product });
      }
    }
  }

  const seen = new Set();
  let ok = 0;

  for (const { filename, member, product } of entries) {
    if (seen.has(filename)) continue;
    seen.add(filename);

    const dest = join(imgDir, filename);
    const url = resolveUrl(filename, member);
    if (!url) throw new Error(`No source URL for ${filename}`);

    const bytes = await download(url, dest);
    member.image = `img/${filename}`;
    product.image = product.image || `img/${product.members[0].filename}`;
    console.log(`OK ${filename} (${bytes} bytes)`);
    ok++;
  }

  writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 4)}\n`);
  console.log(`\nDone: ${ok} images saved, catalog image fields updated`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
