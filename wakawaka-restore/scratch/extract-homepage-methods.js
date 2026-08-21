const fs = require('fs');
const c = fs.readFileSync('wakawaka-restore/scratch/Homepage.prod.js', 'utf8');

const markers = [
  'key:"generateRandomGrid"',
  'key:"onShown"',
  'key:"calculateZ"',
  'key:"update"',
  'key:"hideComponent"',
];

for (let i = 0; i < markers.length; i++) {
  const start = c.indexOf(markers[i]);
  const end = i + 1 < markers.length ? c.indexOf(markers[i + 1]) : start + 1200;
  if (start < 0) {
    console.log('MISS', markers[i]);
    continue;
  }
  console.log('\n\n####################', markers[i], '####################\n');
  console.log(c.slice(start, end > start ? end : start + 1500));
}

// Also find where TL.showPoster.onComplete / grid to is
const gIdx = c.indexOf('this.$grid,{y:0');
console.log('\n\nGRID TO:', c.slice(gIdx - 100, gIdx + 500));
