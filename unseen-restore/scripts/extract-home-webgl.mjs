import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const theme = fs.readFileSync(path.resolve(__dirname, '../scratch/theme.js'), 'utf8');
const outDir = path.resolve(__dirname, '../scratch/webgl');
fs.mkdirSync(outDir, { recursive: true });

const needles = [
  'room-1',
  'room-2',
  'objectsData',
  'pearl-matcap',
  'skymap-tile',
  'land-group',
  'grass-simple',
  'home/chair',
  'pillows',
  'table-3',
  'KTX2Loader',
  'DRACOLoader',
  'GLTFLoader',
  'MeshStandardMaterial',
  'MeshMatcapMaterial',
  'ShaderMaterial',
  'PerspectiveCamera',
  'WebGLRenderer',
  'getElementById("gl")',
  "getElementById('gl')",
  '#gl',
  'Dom2Webgl',
  'ASScroll',
  'homeContact',
  'HomeWorld',
  'HomeScene',
  'particles',
];

const hits = [];
for (const n of needles) {
  let from = 0;
  let count = 0;
  while (true) {
    const i = theme.indexOf(n, from);
    if (i < 0) break;
    count++;
    if (count <= 3) {
      hits.push({ needle: n, index: i, snippet: theme.slice(Math.max(0, i - 120), Math.min(theme.length, i + 220)) });
    }
    from = i + n.length;
  }
  if (count === 0) hits.push({ needle: n, index: -1, snippet: 'MISSING' });
}

fs.writeFileSync(path.join(outDir, 'theme-hits.json'), JSON.stringify(hits, null, 2));

// Extract likely asset path literals
const assetRe = /(?:models|images)\/home\/[a-zA-Z0-9_.\-]+/g;
const assets = [...new Set(theme.match(assetRe) || [])].sort();
fs.writeFileSync(path.join(outDir, 'home-asset-literals.txt'), assets.join('\n'));

// Extract chunks mentioning "home/" within ~400 chars of glb/ktx2
const contexts = [];
for (const m of theme.matchAll(/[^"']{0,40}(?:models|images)\/home\/[^"']{1,80}/g)) {
  contexts.push(m[0]);
}
fs.writeFileSync(path.join(outDir, 'home-path-contexts.txt'), [...new Set(contexts)].join('\n'));

console.log('hits', hits.filter((h) => h.index >= 0).length, 'missing', hits.filter((h) => h.index < 0).map((h) => h.needle).join(','));
console.log('home assets', assets.length);
console.log(assets.join('\n'));
