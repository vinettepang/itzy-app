const fs = require('fs');
const path = require('path');
const h = fs.readFileSync(path.join(__dirname, 'home2.html'), 'utf8');
const m = h.match(/<svg width="93"[\s\S]*?<\/svg>/);
if (!m) {
  console.error('logo not found');
  process.exit(1);
}
fs.writeFileSync(path.join(__dirname, 'logo-full.svg'), m[0]);
console.log('written', m[0].length);

// Pretty-print paths for React component
const svg = m[0]
  .replace(/class="fill-main group-hover:fill-hover"/g, 'className="sc-logo__path"')
  .replace(/fill="none"/, 'fill="none" aria-hidden="true"');
fs.writeFileSync(path.join(__dirname, 'logo-react-snippet.txt'), svg);
console.log('snippet ok');
