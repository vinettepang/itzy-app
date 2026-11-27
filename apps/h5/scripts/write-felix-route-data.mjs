import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cache = path.join(__dirname, '.felix-route-data.json');
const root = path.resolve(__dirname, '../public/felixpeault');

if (!fs.existsSync(cache)) {
  console.error('Missing', cache, '- run scripts/capture-felix-route-data.mjs via Playwright first');
  process.exit(1);
}

const { series, info } = JSON.parse(fs.readFileSync(cache, 'utf8'));
for (const [route, body] of Object.entries({ series, info })) {
  const dir = path.join(root, route);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, '__data.json'), body);
  console.log('wrote', route, body.length);
}
