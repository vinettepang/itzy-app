const fs = require('fs');
const css = fs.readFileSync(__dirname + '/entry.css', 'utf8');

const picks = [
  /--main:[^;]+/,
  /--sec:[^;]+/,
  /--hover:[^;]+/,
  /--bg:[^;]+/,
  /--media:[^;]+/,
  /--light:[^;]+/,
  /fill-main[^}]+}/,
  /fill-hover[^}]+}/,
  /aspect-\[5\/3\.5\][^}]+}/,
  /Baikal[^;]{0,80}/g,
];

for (const p of picks) {
  const m = css.match(p);
  if (!m) {
    console.log('MISS', String(p));
    continue;
  }
  if (p.global) {
    console.log('---', p);
    console.log([...css.matchAll(p)].slice(0, 5).map((x) => x[0]).join('\n'));
  } else {
    console.log('---', m[0].slice(0, 300));
  }
}

// Find carousel-related from home HTML
const html = fs.readFileSync(__dirname + '/home2.html', 'utf8');
const chunk = html.match(/carouselContainer[\s\S]{0,500}/);
console.log('carousel snippet', chunk ? chunk[0].slice(0, 400) : 'none');

// Extract useful class strings around work intro
const introIdx = html.indexOf('intentionally compact');
console.log('intro context', html.slice(Math.max(0, introIdx - 400), introIdx + 200));
