const fs = require('fs');
const body = fs.readFileSync(__dirname + '/module-6750.js', 'utf8');
const slices = [
  ['noise-d', 353, 768],
  ['roll-h', 768, 18268],
  ['split-p', 18268, 18475],
  ['svg-u', 18475, 19771],
  ['ctrl-m', 19771, 20738],
  ['export-f', 20738, 21803],
  ['page-x', 21803, body.length],
];
for (const [name, a, b] of slices) {
  const chunk = body.slice(a, b);
  fs.writeFileSync(__dirname + `/fn-${name}.js`, chunk.replace(/;/g, ';\n').replace(/\{/g, '{\n'));
  console.log(name, chunk.length);
}
