import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const fontsDir = path.join(root, 'apps/h5/public/wakawaka-static/fonts');
fs.mkdirSync(fontsDir, { recursive: true });

const fonts = [
  ['78c2cb8d6c54087bb4be', 'waka-sans-400.woff2'],
  ['8ff95cff433faf482de7', 'waka-sans-500.woff2'],
  ['a26dd78efba8d50bb671', 'waka-sans-700.woff2'],
  ['1193a2b2c357644f7fb8', 'domaine-text-300.woff2'],
];

function download(url, out) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(out);
    https
      .get(url, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          file.close();
          fs.unlinkSync(out);
          return download(res.headers.location, out).then(resolve, reject);
        }
        if (res.statusCode !== 200) {
          reject(new Error(`${url} -> ${res.statusCode}`));
          return;
        }
        res.pipe(file);
        file.on('finish', () => file.close(() => resolve(fs.statSync(out).size)));
      })
      .on('error', reject);
  });
}

for (const [hash, name] of fonts) {
  const url = `https://wakawaka.world/assets/${hash}.woff2`;
  const out = path.join(fontsDir, name);
  const size = await download(url, out);
  console.log(name, size);
}

const cssPath = path.join(root, 'apps/h5/src/pages/wakawaka/wakawaka.prod.css');
let css = fs.readFileSync(cssPath, 'utf8');
const hashToName = Object.fromEntries(fonts);
for (const [hash, name] of fonts) {
  css = css.split(`/assets/${hash}.woff2`).join(`/wakawaka-static/fonts/${name}`);
  css = css.split(`${hash}.woff2`).join(`/wakawaka-static/fonts/${name}`);
}
css = css.replace(/url\((['"]?)(?:\.\.?\/)?(?:assets\/)?([a-f0-9]{20})\.woff2\1\)/g, (m, q, hash) => {
  const name = hashToName[hash];
  return name ? `url(${q}/wakawaka-static/fonts/${name}${q})` : m;
});
fs.writeFileSync(cssPath, css);
const hits = [...css.matchAll(/url\(([^)]*woff2[^)]*)\)/g)].map((x) => x[1]);
console.log('font urls:', [...new Set(hits)].join('\n'));
