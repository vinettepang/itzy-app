import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../apps/h5/public/facil-static');
const files = [
  ['fonts/times.woff', 'https://facilagencia.com/assets/fonts/times.woff'],
  ['fonts/icomoon.woff', 'https://facilagencia.com/assets/fonts/icomoon.woff'],
  ['fonts/libertinus-mono-v1-latin-regular.woff2', 'https://facilagencia.com/assets/fonts/libertinus-mono-v1-latin-regular.woff2'],
  ['images/sprite.svg', 'https://facilagencia.com/assets/images/sprite.svg?v=2'],
];

for (const [rel, url] of files) {
  const out = path.join(root, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  fs.writeFileSync(out, Buffer.from(await res.arrayBuffer()));
  console.log('ok', rel, fs.statSync(out).size);
}
