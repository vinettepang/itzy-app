/**
 * 下载 Noth 本地字体 + 按 offline-manifest 补齐 public/noth/assets
 */
import { createWriteStream, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import https from 'node:https';
import http from 'node:http';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const FONTS_DIR = join(ROOT, 'public/noth/fonts');
const ASSETS_DIR = join(ROOT, 'public/noth/assets');
const MANIFEST = join(ROOT, 'public/noth/offline-manifest.json');
const SITE_ID = '6a0c501c42b9751b78a9d1a7';

const FONT_FILES = [
  `https://cdn.prod.website-files.com/${SITE_ID}/fonts/PPNeueMontreal-Book.woff2`,
  `https://cdn.prod.website-files.com/${SITE_ID}/fonts/PPNeueMontreal-Medium.woff2`,
  'https://www.noth.in/fonts/PPNeueMontreal-Book.woff2',
  'https://www.noth.in/fonts/PPNeueMontreal-Medium.woff2',
  'https://fonts.gstatic.com/s/ibmplexmono/v20/-F63fjptAgt5VM-kVkqdyU8n1i8q1w.woff2',
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    if (existsSync(dest)) return resolve('skip');
    mkdirSync(dirname(dest), { recursive: true });
    const mod = url.startsWith('https') ? https : http;
    mod
      .get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0',
          Referer: 'https://www.noth.in/',
          Accept: '*/*',
        },
      }, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          download(res.headers.location, dest).then(resolve).catch(reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`${url} → ${res.statusCode}`));
          return;
        }
        const file = createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => file.close(() => resolve('ok')));
      })
      .on('error', reject);
  });
}

async function main() {
  for (const url of FONT_FILES) {
    const name = url.split('/').pop();
    const dest = join(FONTS_DIR, name);
    try {
      const r = await download(url, dest);
      console.log('font', name, r);
    } catch (e) {
      console.warn('font fail', name, e.message);
    }
  }

  if (!existsSync(MANIFEST)) {
    console.warn('no offline-manifest.json, skip assets');
    return;
  }
  const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
  const entries = Object.entries(manifest.assets || {});
  let ok = 0;
  let fail = 0;
  for (const [remote, local] of entries) {
    if (!remote.startsWith('http') || local.endsWith('-asset')) continue;
    const dest = join(ASSETS_DIR, local);
    try {
      const r = await download(remote, dest);
      if (r === 'ok') ok++;
    } catch (e) {
      fail++;
      console.warn('asset fail', local, e.message);
    }
  }
  console.log('assets synced', { ok, fail, total: entries.length });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
