import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = __dirname;
const routes = [
  '/',
  '/studio',
  '/catalogue',
  '/furniture/chair-collection',
  '/cylinder-back',
  '/furniture',
  '/compartment-chair',
];

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => resolve({ status: res.statusCode, body }));
      })
      .on('error', reject);
  });
}

const summary = { routes: [] };

for (const route of routes) {
  const url = `https://wakawaka.world${route}`;
  const { status, body } = await get(url);
  const m = body.match(/id=["']?__PLATO_DATA__["']?[^>]*>([\s\S]*?)<\/script>/i);
  let plato = null;
  if (m) {
    try {
      plato = JSON.parse(m[1]);
    } catch (e) {
      plato = { err: String(e) };
    }
  }
  const file = path.join(dir, `plato${route.replace(/\//g, '_') || '_home'}.json`);
  fs.writeFileSync(file, JSON.stringify(plato, null, 2));
  const keys = plato?.serverData ? Object.keys(plato.serverData) : [];
  summary.routes.push({ route, status, keys, file, bytes: fs.statSync(file).size });
  console.log(route, status, keys.join(','));
}

fs.writeFileSync(path.join(dir, 'route-summary.json'), JSON.stringify(summary, null, 2));
console.log('done');
