const fs = require('fs');
const c = fs.readFileSync('wakawaka-restore/scratch/main.prod.js', 'utf8');
console.log('len', c.length);

// Find webpack chunk map / public path
const keys = [
  'Homepage',
  'calculateZ',
  'showPoster',
  'generateRandomGrid',
  'grid__animation',
  '1500',
  '1100',
  '1800',
  'power4',
  'power3.inOut',
  'main-background',
  'perspective',
  'featuredChairs',
  'layout-',
];

for (const k of keys) {
  let i = 0;
  let n = 0;
  while ((i = c.indexOf(k, i)) >= 0 && n < 3) {
    console.log('\n===', k, i, '===');
    console.log(c.slice(Math.max(0, i - 150), i + 450));
    i += k.length;
    n++;
  }
  if (n === 0) console.log('MISS', k);
}

// Chunk IDs that mention Homepage
const chunkMatches = [...c.matchAll(/(\d{2,4}):\s*"([a-f0-9]{16,})"/g)].slice(0, 5);
console.log('\nchunk samples', chunkMatches.map((m) => m[0]).slice(0, 10));
