import fs from 'node:fs';

const js = fs.readFileSync(new URL('./Product.js', import.meta.url), 'utf8');

for (const k of [
  'defaultToZoom',
  'zoomToDefault',
  'onHoverArea',
  'canZoom',
  'speed:',
  'dx:',
  'dy:',
  'isPaused',
  'product__pause',
  'wheel',
  'deltaY',
  'handlers.on',
]) {
  let i = 0;
  let c = 0;
  while ((i = js.indexOf(k, i)) >= 0 && c < 2) {
    console.log('\n##', k, i);
    console.log(js.slice(Math.max(0, i - 60), i + 500));
    i += k.length;
    c++;
  }
}
