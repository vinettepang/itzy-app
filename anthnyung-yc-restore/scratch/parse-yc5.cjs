const fs = require('fs');
const path = require('path');
const raw = fs.readFileSync(path.join(__dirname, 'page-f3b41d12594d0335.js'), 'utf8');

// Find colors array assignment for mesh
const patterns = [
  /colors:\[[^\]]{10,200}\]/g,
  /distortionShape:"[^"]+"/g,
  /shape:"[^"]+"/g,
  /intensity:[0-9.]+/g,
  /highlights:[0-9.]+/g,
  /shift:[0-9.]+/g,
  /blur:[0-9.]+/g,
  /size:[0-9.]+/g,
  /count:[0-9.]+/g,
  /FF6A00|FC5E10|FF8A30|FFCB8E|FFE4C2/gi,
];
for (const p of patterns) {
  const m = raw.match(p);
  if (m) console.log(p, [...new Set(m)].join(' | '));
}

// Find glass props object near distortionShape
const di = raw.indexOf('distortionShape:"prism"');
console.log('\nprism context\n', raw.slice(di - 800, di + 400));

// Find colors:l definition
const li = raw.indexOf('colors:l,distortion');
console.log('\ncolors:l near\n', raw.slice(li - 500, li + 200));

// Find let l= or const l=
const colorDef = raw.match(/l=(\[[^\]]+\])/);
console.log('l=', colorDef && colorDef[1]);

// Find c= object for glass
const ci = raw.indexOf('distortion:.39');
console.log('\ndistortion.39\n', raw.slice(ci - 500, ci + 400));
