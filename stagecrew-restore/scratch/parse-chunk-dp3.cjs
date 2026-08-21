const fs = require('fs');
const src = fs.readFileSync(__dirname + '/chunk-dp3.js', 'utf8');

// Pretty-ish dump of template strings and key constants
const consts = src.match(/ze=\d+|Ne=[\d.]+|ne=[\d.]+|Oe=[\d.]+|re=\d+|Ve=\d+|We=\d+/g);
console.log('consts', consts);

// Extract template class strings
const classes = [...src.matchAll(/class:"([^"]+)"/g)].map(m => m[1]);
console.log('classes:\n', classes.join('\n---\n'));

// Extract Coming soon / navigate related
const snippets = [];
for (const key of ['Coming Soon', 'navigateTo', 'is_coming', 'scroll', 'wheel', 'pointer', 'translate', 'drag', 'velocity', 'lerp', 'requestAnimationFrame', 'onClick', 'slug']) {
  const i = src.indexOf(key);
  if (i >= 0) snippets.push(`\n=== ${key} @${i} ===\n` + src.slice(Math.max(0, i - 120), i + 200));
}
fs.writeFileSync(__dirname + '/chunk-dp3-snippets.txt', snippets.join('\n'));
console.log('wrote snippets', snippets.length);

// Also dump whole file prettier by adding newlines after ; and {
const pretty = src.replace(/;/g, ';\n').replace(/\{/g, '{\n').replace(/\}/g, '\n}\n');
fs.writeFileSync(__dirname + '/chunk-dp3-pretty.js', pretty);
console.log('pretty length', pretty.length);
