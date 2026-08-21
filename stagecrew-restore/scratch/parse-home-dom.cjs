const fs = require('fs');
const html = fs.readFileSync(__dirname + '/home2.html', 'utf8');

// Extract a chunk around carousel
const idx = html.indexOf('carouselContainer');
console.log('carousel idx', idx);
console.log(html.slice(idx - 200, idx + 2500));

// Find Nuxt chunk URLs
const chunks = [...html.matchAll(/\/_nuxt\/[^\"']+\.js/g)].map(m => m[0]);
console.log('chunks', [...new Set(chunks)]);
