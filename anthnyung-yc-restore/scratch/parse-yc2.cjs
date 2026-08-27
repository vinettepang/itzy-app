const fs = require('fs');
const path = require('path');
const dir = __dirname;
const page = fs.readFileSync(path.join(dir, 'page-f3b41d12594d0335.js'), 'utf8');

// Find MeshGradient / Glass / colors
const patterns = [
  /MeshGradient[^,]{0,200}/g,
  /GlassPanel[^,]{0,200}/g,
  /LiquidGlass[^,]{0,200}/g,
  /colors:\[[^\]]{0,300}\]/g,
  /#[0-9a-fA-F]{3,8}/g,
  /tear[^,]{0,120}/gi,
  /is-attached|is-torn|is-detached/g,
  /html-to-image|html2canvas|toPng|toBlob/g,
  /from\"([^\"]+shaders[^\"]*)\"/g,
];

for (const p of patterns) {
  const m = page.match(p);
  if (m) {
    console.log('\n---', p);
    console.log([...new Set(m)].slice(0, 30).join('\n'));
  }
}

// Also search 983 chunk
const c983 = fs.readFileSync(path.join(dir, '983-b3b997b6e5d650ae.js'), 'utf8');
console.log('\n983 has MeshGradient', c983.includes('MeshGradient'));
console.log('983 has Glass', /Glass/.test(c983));
console.log('983 paper', c983.includes('paper-design') || c983.includes('@paper'));

const big = fs.readFileSync(path.join(dir, 'b536a0f1-bdb433004a98de3c.js'), 'utf8');
console.log('big MeshGradient', big.includes('MeshGradient'));
console.log('big Glass', big.includes('glass') && big.includes('shader'));
console.log('big paper-design', big.includes('paper-design') || big.includes('@paper-design'));

// Extract CSS custom properties and key rules from page css
const css = fs.readFileSync(path.join(dir, 'd8c3ce809391817c.css'), 'utf8');
fs.writeFileSync(path.join(dir, 'yc-page.css'), css.replace(/\}/g, '}\n').replace(/\{/g, '{\n'));
console.log('css bytes', css.length);

// Dump interesting substrings around tear
const idx = page.indexOf('tear');
console.log('tear context', page.slice(Math.max(0, idx - 100), idx + 400));
