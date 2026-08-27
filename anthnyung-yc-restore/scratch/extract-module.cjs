const fs = require('fs');
const raw = fs.readFileSync(__dirname + '/page-f3b41d12594d0335.js', 'utf8');
// Extract module 6750 body roughly
const start = raw.indexOf('6750:function');
const end = raw.indexOf('},1827:');
const body = end > start ? raw.slice(start, end) : raw.slice(start, start + 50000);
fs.writeFileSync(__dirname + '/module-6750.js', body);
console.log('module len', body.length);

// Find image-related
for (const k of ['image:', 'ImageBitmap', 'createImageBitmap', 'html-to-image', 'toPng', 'toBlob', 'offsetX', 'fit:"cover"']) {
  let c = 0, i = 0;
  while ((i = body.indexOf(k, i)) !== -1) { c++; i += k.length; }
  console.log(k, c);
}

const oi = body.indexOf('offsetX');
console.log('offsetX ctx', body.slice(oi - 200, oi + 400));

const ti = body.indexOf('toBlob');
console.log('toBlob ctx', body.slice(ti - 300, ti + 400));

// Tear state machine snippet
const tearIdx = body.indexOf('phase:"attached"');
console.log('phase init', body.slice(tearIdx - 100, tearIdx + 800));
