import fs from 'node:fs';

const js = fs.readFileSync(new URL('./Product.js', import.meta.url), 'utf8');

// Dump key method bodies around interesting markers
const markers = [
  'key:"zoom"',
  'key:"onZoom"',
  'view:"zoom"',
  'state.view',
  'key:"render"',
  'key:"update"',
  'key:"onClick"',
  'key:"onWheel"',
  'product-hover',
  'Pause',
  'displayWidth',
  'setSizeItemsDefault',
  'imagesGallery',
  'key:"initDOM"',
  'key:"onShown"',
  'key:"toggleInfo"',
  'key:"onInfo"',
];

for (const k of markers) {
  const i = js.indexOf(k);
  if (i < 0) {
    console.log('MISS', k);
    continue;
  }
  console.log('\n========', k, '@', i);
  console.log(js.slice(i, i + 700));
}
