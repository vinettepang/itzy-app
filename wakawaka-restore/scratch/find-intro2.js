const fs = require('fs');
const files = [
  'wakawaka-restore/scratch/Homepage.prod.js',
  'wakawaka-restore/scratch/219.prod.js',
  'wakawaka-restore/scratch/main.prod.js',
  'wakawaka-restore/scratch/chunk219.js',
  'wakawaka-restore/scratch/chunk219b.js',
];

const keys = [
  'calculateZ',
  'showPoster',
  'generateRandomGrid',
  '1500',
  '1100',
  '1800',
  'power4',
  'autoAlpha',
  'grid__animation',
  'main-background',
  'perspective',
  'force3D',
  'layout-',
  'featuredChairs',
  '7625',
  'yOffset',
  'pageHeight',
  'innerHeight',
];

for (const f of files) {
  if (!fs.existsSync(f)) {
    console.log('MISSING', f);
    continue;
  }
  const c = fs.readFileSync(f, 'utf8');
  console.log('\n########', f, c.length);
  for (const k of keys) {
    let i = c.indexOf(k);
    if (i < 0) continue;
    console.log('\n---', k, i, '---');
    console.log(c.slice(Math.max(0, i - 200), i + 600));
  }
}
