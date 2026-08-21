import fs from 'node:fs';

const js = fs.readFileSync(new URL('./Product.js', import.meta.url), 'utf8');
const keys = [
  'canvas',
  'getContext',
  'drawImage',
  'LARGER',
  'zoom',
  'sequence',
  'imagesGallery',
  'pdp',
  'wheel',
  'scale',
  'preload',
  'requestAnimationFrame',
  'Image(',
  'naturalWidth',
];
for (const k of keys) {
  let i = 0;
  let c = 0;
  while ((i = js.indexOf(k, i)) >= 0 && c < 2) {
    console.log('\n##', k, '@', i);
    console.log(js.slice(Math.max(0, i - 100), i + 300));
    i += k.length;
    c++;
  }
}
console.log('\nlen', js.length);
