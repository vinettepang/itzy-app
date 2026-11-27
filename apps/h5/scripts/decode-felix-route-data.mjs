import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const b64Path = path.join(__dirname, '.felix-route-data.b64');
const root = path.resolve(__dirname, '../public/felixpeault');

const b64 = fs.readFileSync(b64Path, 'utf8').trim();
const { series, info } = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
for (const [route, body] of Object.entries({ series, info })) {
  if (!body.trim().startsWith('{')) throw new Error(`invalid ${route}`);
  const dir = path.join(root, route);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, '__data.json'), body);
  console.log('wrote', route, body.length);
}
