const fs = require('fs');
const body = fs.readFileSync(__dirname + '/module-6750.js', 'utf8');

// Pretty-print roughly
const pretty = body
  .replace(/;/g, ';\n')
  .replace(/\{/g, '{\n')
  .replace(/\}/g, '\n}\n');
fs.writeFileSync(__dirname + '/module-6750-pretty.js', pretty);

// Find tear controller - look for phase:"attached"
const markers = ['phase:"attached"', 'function g(', 'tear:function', 'reset:function', 'onPointerDown', 'progressRef'];
for (const m of markers) {
  const i = body.indexOf(m);
  console.log(m, i);
}

// Dump from first "phase:\"attached\"" related state machine - search useState
const us = body.indexOf('useState({phase');
console.log('useState phase', us);
if (us < 0) {
  const us2 = body.indexOf('phase:"attached"');
  console.log(body.slice(us2 - 200, us2 + 1500));
} else {
  console.log(body.slice(us, us + 2000));
}
