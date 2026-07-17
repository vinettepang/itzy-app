const fs = require('fs');
const js = fs.readFileSync(
  'c:/projects/study/vibe-coding/itzy-app/facilagencia-restore/scratch/assets_main.349d1f432ba089f13621.js',
  'utf8',
);
const needle = 'setProperty("--y",this.y)';
const i = js.indexOf(needle);
console.log('idx', i);
fs.writeFileSync(
  'c:/projects/study/vibe-coding/itzy-app/facilagencia-restore/scratch/scroll-item-snip.txt',
  js.slice(Math.max(0, i - 3500), i + 800),
);

// also page transition related
const needles2 = [
  'data-page',
  'pageOut',
  'pageIn',
  'TRANSITION',
  'showPage',
  'hidePage',
  'Router',
  'goto(',
  'navigateTo',
  'Preloader',
];
for (const n of needles2) {
  console.log(n, js.indexOf(n));
}

// Sidemenu open animation
const si = js.indexOf('Sidemenu');
fs.writeFileSync(
  'c:/projects/study/vibe-coding/itzy-app/facilagencia-restore/scratch/sidemenu-snip.txt',
  js.slice(si, si + 2000),
);
