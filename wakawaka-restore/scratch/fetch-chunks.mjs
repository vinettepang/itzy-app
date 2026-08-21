import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const js = fs.readFileSync(path.join(root, 'wakawaka-restore/scratch/main.js'), 'utf8');

const mapMatch = js.match(/\{219:"[^"]+",265:"[^"]+",354:"[^"]+",450:"[^"]+",524:"[^"]+",579:"[^"]+",779:"[^"]+",831:"[^"]+"\}/);
console.log('map', mapMatch?.[0]);

const names = { 831: 'Homepage', 524: 'Product', 779: 'Shop', 450: 'About', 265: 'Index', 219: 'vendor?' };
const hashes = {};
if (mapMatch) {
  for (const m of mapMatch[0].matchAll(/(\d+):"([a-f0-9]+)"/g)) {
    hashes[m[1]] = m[2];
  }
}
console.log(hashes);

function download(url, out) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(out);
    https
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          file.close();
          fs.unlinkSync(out);
          return download(res.headers.location, out).then(resolve, reject);
        }
        if (res.statusCode !== 200) return reject(new Error(`${url} ${res.statusCode}`));
        res.pipe(file);
        file.on('finish', () => file.close(() => resolve(fs.statSync(out).size)));
      })
      .on('error', reject);
  });
}

for (const id of ['831', '524', '219']) {
  const hash = hashes[id];
  if (!hash) continue;
  const url = `https://wakawaka.world/assets/js/${id}.${hash}.js`;
  const out = path.join(root, 'wakawaka-restore/scratch', `${names[id] || id}.${hash}.js`);
  const size = await download(url, out);
  console.log(url, '->', path.basename(out), size);
}
