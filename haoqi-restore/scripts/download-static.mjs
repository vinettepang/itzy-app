/**
 * Download haoqi.design static assets (models/fonts/images) into h5 public/haoqi.
 * Resolves gltf external .bin/texture dependencies.
 */
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pub = join(__dirname, '..', '..', 'apps', 'h5', 'public', 'haoqi-static');
const mirror = join(__dirname, '..', 'assets', 'static');

const BASE = 'https://haoqi.design';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';

function getBuf(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': UA } }, (res) => {
      if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location && redirects < 5) {
        res.resume();
        const next = res.headers.location.startsWith('http') ? res.headers.location : new URL(res.headers.location, url).href;
        resolve(getBuf(next, redirects + 1));
        return;
      }
      const chunks = [];
      res.on('data', (d) => chunks.push(d));
      res.on('end', () => resolve({ status: res.statusCode, buf: Buffer.concat(chunks) }));
    });
    req.on('error', reject);
    req.setTimeout(45000, () => req.destroy(new Error('timeout')));
  });
}

function saveBoth(relPath, buf) {
  for (const root of [pub, mirror]) {
    const dest = join(root, relPath);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, buf);
  }
}

async function fetchSave(relPath) {
  const url = `${BASE}/${relPath}`;
  const r = await getBuf(url);
  if (r.status !== 200) {
    console.log('MISS', r.status, relPath);
    return null;
  }
  saveBoth(relPath, r.buf);
  console.log('OK', relPath, r.buf.length, 'b');
  return r.buf;
}

async function main() {
  const files = [
    'model/hello.gltf', 'model/cursor.glb', 'model/cnt.gltf',
    'fonts/TikTokSans.ttf', 'fonts/GeistMono[wght].ttf',
    'img/m3.png', 'icon.svg', 'apple-icon.png',
  ];
  for (let i = 1; i <= 12; i++) files.push(`sticker_img/s_${String(i).padStart(2, '0')}.png`);
  const work = [
    'reunimos01', 'reunimos02', 'inspire_mono_01', 'inspire_mono_02', 'wasm01', 'wasm02',
    'vs01', 'vs02', 'ds01', 'ds02', 'ali01', 'ali02', 'si', 'si02', 'c4', 's01', 's02', 'sd01', 'sd02',
  ];
  for (const w of work) files.push(`work/${w}.png`);

  const gltfBufs = {};
  for (const f of files) {
    const buf = await fetchSave(f);
    if (buf && f.endsWith('.gltf')) gltfBufs[f] = buf;
  }

  // Resolve gltf external deps (.bin, textures)
  for (const [f, buf] of Object.entries(gltfBufs)) {
    let json;
    try { json = JSON.parse(buf.toString('utf8')); } catch { continue; }
    const dir = dirname(f);
    const uris = new Set();
    (json.buffers ?? []).forEach((b) => b.uri && !b.uri.startsWith('data:') && uris.add(b.uri));
    (json.images ?? []).forEach((im) => im.uri && !im.uri.startsWith('data:') && uris.add(im.uri));
    for (const uri of uris) {
      const rel = join(dir, uri).replace(/\\/g, '/');
      await fetchSave(rel);
    }
    console.log(`gltf ${f}: deps=${[...uris].join(',') || 'embedded'}`);
  }

  console.log('\nDone. public:', pub);
}

main().catch((e) => { console.error(e); process.exit(1); });
