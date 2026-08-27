const fs = require('fs');
const path = require('path');
const dir = __dirname;
const page = fs.readFileSync(path.join(dir, 'page-pretty.js'), 'utf8');
const c983 = fs.readFileSync(path.join(dir, '983-b3b997b6e5d650ae.js'), 'utf8');

// Find mesh-layer jsx
const mi = page.indexOf('mesh-layer');
console.log('mesh jsx\n', page.slice(mi - 300, mi + 800));

const gi = page.indexOf('glass-layer');
console.log('\nglass jsx\n', page.slice(gi - 300, gi + 800));

const ni = page.indexOf('paper-noise');
console.log('\nnoise\n', page.slice(ni - 200, ni + 600));

// Find createShader / colors arrays in 983 near orange
const orange = c983.indexOf('#FF6A00');
console.log('\n983 orange', orange);
if (orange > 0) console.log(c983.slice(orange - 400, orange + 600));

// Search distortion swirl grain
for (const k of ['distortion','swirl','grainMixer','grainOverlay','speed','softness','count','shape']) {
  const re = new RegExp(k + '[^,]{0,40}', 'g');
  const m = page.match(re);
  if (m) console.log('page', k, [...new Set(m)].slice(0,5));
  const m2 = c983.match(re);
  if (m2) console.log('983', k, [...new Set(m2)].slice(0,5));
}

// Find imported module ids used near mesh
const importMatch = page.match(/from\("[^"]+"\)|require\([^)]+\)/g);
console.log('imports', importMatch);

// Look for hex colors near children: of mesh
const allColors = [...page.matchAll(/#(FF6A00|FC5E10|FF8A30|FFCB8E|FFE4C2)/gi)];
console.log('color count', allColors.length);

// Dump section with FF6A00 from raw page (not pretty) - maybe pretty broke it
const raw = fs.readFileSync(path.join(dir, 'page-f3b41d12594d0335.js'), 'utf8');
const ci = raw.indexOf('#FF6A00');
console.log('\nraw color\n', raw.slice(ci - 600, ci + 900));
