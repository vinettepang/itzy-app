/**
 * Resolve image URLs via Fandom API, then download catalog images.
 * Run: node scripts/download-catalog-images.mjs
 */
import { readFileSync, mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const catalogPath = join(root, 'src/data/wdzy_twinzy_catalog.json');
const imgDir = join(root, 'src/data/img');

const FANDOM_TITLES = {
  HATT: 'HATT',
  LYA: 'LYA',
  TUK: 'TUK',
  CHUNG_EE: 'CHUNG-EE',
  CABBIT: 'CABBIT',
  KKengEE: 'KKengEE',
  'Li-Li': 'Li-Li',
  RyuJJi: 'RyuJJi',
  RyeoWoo: 'RyeoWoo',
  NAong: 'NAong',
};

const EBAY_WDZY_PLUSH = {
  wdzy_hatt_plush_2021: 'https://i.ebayimg.com/images/g/2BoAAOSwaXtjWchy/s-l1600.jpg',
  wdzy_lya_plush_2021: 'https://i.ebayimg.com/images/g/2B0AAOSwaXtjWchz/s-l1600.jpg',
  wdzy_tuk_plush_2021: 'https://i.ebayimg.com/images/g/gB8AAOSwe6JjWchz/s-l1600.jpg',
  wdzy_chung_ee_plush_2021: 'https://i.ebayimg.com/images/g/b4UAAOSwXZZjWchy/s-l1600.jpg',
  wdzy_cabbit_plush_2021: 'https://i.ebayimg.com/images/g/j54AAOSwUS1jWchw/s-l1600.jpg',
};

async function fetchFandomThumb(title) {
  const url = `https://itzy.fandom.com/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&pithumbsize=800&format=json`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'itzy-app-catalog-downloader/1.0' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Fandom API HTTP ${res.status} for ${title}`);
  const data = await res.json();
  const pages = data?.query?.pages ?? {};
  const page = Object.values(pages)[0];
  if (page?.missing) throw new Error(`Fandom page missing: ${title}`);
  const src = page?.thumbnail?.source;
  if (!src) throw new Error(`No thumbnail for ${title}`);
  return src;
}

async function resolveCharacterUrls() {
  const map = {};
  for (const [key, title] of Object.entries(FANDOM_TITLES)) {
    try {
      map[key] = await fetchFandomThumb(title);
      console.log(`Resolved ${key} -> ${map[key]}`);
    } catch (e) {
      console.error(`Could not resolve ${key}: ${e.message}`);
    }
  }
  return map;
}

function characterKey(member) {
  return member.character ?? member.twinzyName ?? '';
}

function resolveUrl(filename, member, characterUrls) {
  if (EBAY_WDZY_PLUSH[filename]) return EBAY_WDZY_PLUSH[filename];
  const key = characterKey(member);
  return characterUrls[key] ?? null;
}

async function download(url, dest) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'itzy-app-catalog-downloader/1.0' },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(dest, buf);
  return buf.length;
}

async function main() {
  mkdirSync(imgDir, { recursive: true });
  const characterUrls = await resolveCharacterUrls();
  const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
  const entries = [];

  for (const series of ['wdzy', 'twinzy']) {
    for (const product of catalog[series]) {
      for (const member of product.members) {
        entries.push({ filename: member.filename, member });
      }
    }
  }

  const seen = new Set();
  let ok = 0;
  let fail = 0;

  for (const { filename, member } of entries) {
    if (seen.has(filename)) continue;
    seen.add(filename);

    const dest = join(imgDir, filename);
    const url = resolveUrl(filename, member, characterUrls);
    if (!url) {
      console.error(`NO URL: ${filename}`);
      fail++;
      continue;
    }

    try {
      const bytes = await download(url, dest);
      console.log(`OK ${filename} (${bytes} bytes)`);
      ok++;
    } catch (e) {
      console.error(`FAIL ${filename}: ${e.message}`);
      fail++;
    }
  }

  console.log(`\nDone: ${ok} ok, ${fail} failed, ${seen.size} unique files`);
  if (fail > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
