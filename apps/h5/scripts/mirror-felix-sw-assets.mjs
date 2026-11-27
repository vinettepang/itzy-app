/**
 * 从 service-worker.js 解析全部 _app 资源并下载；顺带拉取 series/info 的 __data.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../public/felixpeault');
const ORIGIN = 'https://felixpeault.com';

const EXTRA = [
  '/series/__data.json',
  '/info/__data.json',
  '/journeys/__data.json',
  '/series',
  '/info',
];

function download(urlPath) {
  const url = `${ORIGIN}${urlPath}`;
  return execFileSync(
    'curl.exe',
    [
      '-sL',
      '-A',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120',
      '-H',
      `Referer: ${ORIGIN}/`,
      url,
    ],
    { encoding: 'buffer', maxBuffer: 80 * 1024 * 1024 },
  );
}

function pathsFromServiceWorker() {
  const sw = fs.readFileSync(path.join(ROOT, 'service-worker.js'), 'utf8');
  const paths = new Set();
  const re = /path:`([^`]+)`/g;
  let m;
  while ((m = re.exec(sw))) {
    const p = m[1];
    if (p.startsWith('_app/')) paths.add(`/${p}`);
  }
  return paths;
}

function save(urlPath, buf) {
  const dest = path.join(ROOT, urlPath.replace(/^\//, ''));
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buf);
}

const queue = [...pathsFromServiceWorker(), ...EXTRA];
let ok = 0;
let fail = 0;
for (const urlPath of queue) {
  const dest = path.join(ROOT, urlPath.replace(/^\//, ''));
  if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
    continue;
  }
  try {
    const buf = download(urlPath);
    if (buf.length < 32 && urlPath.endsWith('.js')) {
      throw new Error(`suspiciously small (${buf.length} bytes)`);
    }
    save(urlPath, buf);
    process.stdout.write(`ok ${urlPath}\n`);
    ok++;
  } catch (e) {
    process.stderr.write(`fail ${urlPath}: ${e.message}\n`);
    fail++;
  }
}
console.log(`done ok=${ok} fail=${fail}`);
