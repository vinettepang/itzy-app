import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scratch = path.resolve(__dirname, '../scratch');
const t = fs.readFileSync(path.join(scratch, 'theme.js'), 'utf8');

const keys = [
  'ASScroll',
  'AssetLoader',
  'Dom2Webgl',
  'WebGLRenderer',
  'KTX2Loader',
  'DRACOLoader',
  'gsap',
  'Howl',
  'Tone',
  'barba',
  'Highway',
  'pjax',
  'AudioContext',
  'GLTFLoader',
  'BasisTextureLoader',
  'MeshoptDecoder',
  'OrbitControls',
];

const report = [];
for (const k of keys) {
  const m = t.match(new RegExp(k, 'g'));
  report.push(`${k}: ${m ? m.length : 0}`);
}

const assetRe = /(?:resources\/assets\/|wp-content\/uploads\/)[a-zA-Z0-9_./\-]+/g;
const assets = [...t.matchAll(assetRe)].map((m) => m[0]);
const uniq = [...new Set(assets)].sort();

fs.writeFileSync(path.join(scratch, 'theme-signals.txt'), report.join('\n'));
fs.writeFileSync(path.join(scratch, 'asset-refs.txt'), uniq.join('\n'));
console.log(report.join('\n'));
console.log('asset refs', uniq.length);
console.log(uniq.slice(0, 50).join('\n'));
