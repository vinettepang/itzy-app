import fs from 'fs';

const s = fs.readFileSync(new URL('./index.js', import.meta.url), 'utf8');

// Extract quoted strings that look like assets or selectors
const assetRe = /["'`](\.\/[^"'`]+|\/[^"'`]+)["'`]/g;
const assets = new Set();
let m;
while ((m = assetRe.exec(s))) {
  const v = m[1];
  if (/\.(png|jpg|jpeg|webp|hdr|exr|glb|gltf|woff2?|mp4|webm)$/i.test(v) || v.includes('texture') || v.includes('model')) {
    assets.add(v);
  }
}

console.log('=== ASSETS ===');
[...assets].sort().forEach((a) => console.log(a));

// Slice app tail (after three.js)
const markers = ['js-cursor', 'js-loader', 'js-nav-btn', 'js-scene-1', 'MeshPhysicalMaterial'];
for (const k of markers) {
  const i = s.indexOf(k);
  console.log(`\n=== CONTEXT: ${k} @ ${i} ===`);
  if (i >= 0) console.log(s.slice(Math.max(0, i - 200), i + 400));
}

// Find transmission material config patterns
const txRe = /transmission:\s*[\d.]+[^}]{0,300}/g;
console.log('\n=== TRANSMISSION CONFIGS ===');
let t;
let n = 0;
while ((t = txRe.exec(s)) && n++ < 10) console.log(t[0]);
