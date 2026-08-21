/**
 * Decode Nuxt 3 / payload JSON (array with refs) into a plain object tree.
 */
const fs = require('fs');
const path = require('path');

function decodeNuxtPayload(raw) {
  const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
  if (!Array.isArray(data)) return data;
  const seen = new Map();

  function resolve(i, stack = new Set()) {
    if (typeof i !== 'number') return i;
    if (seen.has(i)) return seen.get(i);
    if (stack.has(i)) return { __circular: i };
    stack.add(i);
    const v = data[i];
    let out;
    if (v === null || typeof v !== 'object') {
      out = v;
    } else if (Array.isArray(v)) {
      if (v[0] === 'Reactive' || v[0] === 'ShallowReactive' || v[0] === 'Ref') {
        out = resolve(v[1], stack);
      } else if (v[0] === 'Set') {
        out = [];
      } else {
        out = v.map((x) => resolve(x, stack));
      }
    } else {
      out = {};
      for (const [k, val] of Object.entries(v)) {
        out[k] = resolve(val, stack);
      }
    }
    seen.set(i, out);
    stack.delete(i);
    return out;
  }

  return resolve(0);
}

const dir = __dirname;
for (const f of ['payload-home.json', 'payload-info.json', 'payload-backstage.json']) {
  const p = path.join(dir, f);
  if (!fs.existsSync(p)) continue;
  const decoded = decodeNuxtPayload(fs.readFileSync(p, 'utf8'));
  const out = p.replace('.json', '.decoded.json');
  fs.writeFileSync(out, JSON.stringify(decoded, null, 2));
  console.log('wrote', out, 'keys', Object.keys(decoded));
}
