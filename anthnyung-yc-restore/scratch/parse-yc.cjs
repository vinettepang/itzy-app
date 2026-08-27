const fs = require('fs');
const path = require('path');
const dir = __dirname;

const page = fs.readFileSync(path.join(dir, 'page-f3b41d12594d0335.js'), 'utf8');
const css = fs.readFileSync(path.join(dir, 'd8c3ce809391817c.css'), 'utf8');
const big = fs.readFileSync(path.join(dir, 'b536a0f1-bdb433004a98de3c.js'), 'utf8');

const keys = [
  'paper-shader', 'PaperShader', 'MeshGradient', 'Glass', 'noise',
  'tear', 'roll', 'ticket', 'THREE', 'framer', 'gsap', 'save',
  'html2canvas', 'dom-to-image', 'toBlob', 'download',
];

function findHits(src, label) {
  console.log('\n===' + label + ' len=' + src.length + '===');
  for (const k of keys) {
    let i = 0, c = 0;
    while ((i = src.indexOf(k, i)) !== -1) { c++; i += k.length; }
    if (c) console.log(k, c);
  }
}

findHits(page, 'page');
findHits(big, 'b536');
findHits(fs.readFileSync(path.join(dir, '983-b3b997b6e5d650ae.js'), 'utf8'), '983');

// Extract readable strings from page chunk
const strs = [...page.matchAll(/"([A-Za-z0-9_ .,\-]{4,80})"/g)].map(m => m[1]);
const uniq = [...new Set(strs)].filter(s => /tear|ticket|save|roll|shader|mesh|glass|noise|admit|startup/i.test(s));
console.log('\nstrings', uniq.slice(0, 80));

// CSS class list
const classes = [...css.matchAll(/\.([a-zA-Z0-9_-]+)/g)].map(m => m[1]);
console.log('\ncss classes sample', [...new Set(classes)].slice(0, 100).join(', '));

// Pretty dump page with newlines after ;
fs.writeFileSync(path.join(dir, 'page-pretty.js'), page.replace(/;/g, ';\n').replace(/\{/g, '{\n'));
console.log('wrote page-pretty.js');
