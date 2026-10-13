import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const html = readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'noth', 'index.html'),
  'utf8',
);
const hosts = {};
for (const m of html.matchAll(/https?:\/\/[^"'\\\s<>)]+/gi)) {
  try {
    const h = new URL(m[0].replace(/&amp;/g, '&')).hostname;
    hosts[h] = (hosts[h] || 0) + 1;
  } catch {
    /* ignore */
  }
}
console.log(hosts);
