const fs = require('fs');
const body = fs.readFileSync(__dirname + '/module-6750.js', 'utf8');
const idx = body.indexOf('TEAR OFF TICKET');
console.log('idx', idx);
fs.writeFileSync(__dirname + '/tear-region.js', body.slice(Math.max(0, idx - 5000), idx + 3000));
console.log('wrote tear-region', Math.max(0, idx - 5000), idx + 3000);

// Also dump roll function h entirely until function p or next function
const hStart = body.indexOf('function h(e)');
const pStart = body.indexOf('function p(e)');
fs.writeFileSync(__dirname + '/roll-fn.js', body.slice(hStart, pStart));
console.log('roll fn len', pStart - hStart);

const uStart = body.indexOf('function u(e)');
const nextAfterU = body.indexOf('function y(');
// find function after u - maybe w or export
let cursor = uStart + 10;
let nextFn = body.indexOf('function ', cursor);
// better: find all function names
const fns = [...body.matchAll(/function ([a-zA-Z0-9]+)\(/g)].map(m => ({name:m[1], i:m.index}));
console.log(fns);
