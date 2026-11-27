/**
 * 从线上 felixpeault.com 拉取已构建的静态资源到 public/felixpeault/
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../public/felixpeault');
const ORIGIN = 'https://felixpeault.com';

/** 首页 HTML 易被 Cloudflare 拦截，请用浏览器打开线站后执行 patch-felix-html.mjs 写入 index.html */
const SEED_PATHS = [
  '/fr',
  '/manifest.webmanifest',
  '/humans.txt',
  '/favicon.ico',
  '/favicon.png',
  '/icon.svg',
  '/apple-touch-icon.png',
  '/fonts/Archivo-Variable.woff2',
  '/fonts/SuisseIntlCond-Bold-WebS.woff2',
  '/_app/immutable/assets/0.BbxeAAYK.css',
  '/_app/immutable/assets/1.BeZATRcD.css',
  '/_app/immutable/assets/3.Bj10hmur.css',
  '/_app/immutable/assets/FullscreenPhoto.FLs5qgYk.css',
  '/_app/immutable/assets/InfoPanel.ByiXl0az.css',
  '/_app/immutable/assets/SanityImage.P0n-wPBz.css',
  '/_app/immutable/chunks/B3AEFeHi.js',
  '/_app/immutable/chunks/B8QZZhf6.js',
  '/_app/immutable/chunks/BCWGYF31.js',
  '/_app/immutable/chunks/BLdigoD4.js',
  '/_app/immutable/chunks/BaNbYf_w.js',
  '/_app/immutable/chunks/BbIAz9CX.js',
  '/_app/immutable/chunks/CA02MOab.js',
  '/_app/immutable/chunks/CRq19cw9.js',
  '/_app/immutable/chunks/CTwmDe2x.js',
  '/_app/immutable/chunks/CdWm54DE.js',
  '/_app/immutable/chunks/CnBY_oG_.js',
  '/_app/immutable/chunks/Cpyj0Ts_.js',
  '/_app/immutable/chunks/CuEcKTdK.js',
  '/_app/immutable/chunks/DJlEkNCP.js',
  '/_app/immutable/chunks/DVJg2gu6.js',
  '/_app/immutable/chunks/Dvg8qDmJ.js',
  '/_app/immutable/chunks/UxJW__SQ.js',
  '/_app/immutable/chunks/WbYGDbVO.js',
  '/_app/immutable/chunks/cXWtjmE1.js',
  '/_app/immutable/chunks/hePW80VL.js',
  '/_app/immutable/chunks/qQ3mVfhX.js',
  '/_app/immutable/entry/app.BOQb_9So.js',
  '/_app/immutable/entry/payload.DSmR2FwN.js',
  '/_app/immutable/entry/start.Dt8F1G_t.js',
  '/_app/immutable/nodes/0.C4uMgvS5.js',
  '/_app/immutable/nodes/1.D1EF1vj9.js',
  '/_app/immutable/nodes/2.CwpvqGn0.js',
  '/_app/immutable/nodes/3.xxsYssM5.js',
];

function extractPathsFromHtml(html) {
  const paths = new Set();
  const re = /(?:href|src)=["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(html))) {
    const raw = m[1];
    if (raw.startsWith('data:') || raw.startsWith('http')) continue;
    const p = raw.startsWith('/') ? raw : `/${raw.replace(/^\.\//, '')}`;
    if (p.startsWith('/_app/') || p.startsWith('/fonts/') || p.endsWith('.webmanifest')) paths.add(p);
  }
  return paths;
}

function download(urlPath) {
  const url = urlPath === '/' ? `${ORIGIN}/` : `${ORIGIN}${urlPath}`;
  return execFileSync(
    'curl.exe',
    [
      '-sL',
      '-A',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120',
      '-H',
      'Referer: https://felixpeault.com/',
      url,
    ],
    { encoding: 'buffer', maxBuffer: 50 * 1024 * 1024 },
  );
}

function outFileForPath(urlPath) {
  if (urlPath === '/') return path.join(ROOT, 'index.html');
  if (urlPath === '/fr') return path.join(ROOT, 'fr', 'index.html');
  return path.join(ROOT, urlPath.replace(/^\//, ''));
}

function patchHtml(html) {
  let out = html.replaceAll('https://felixpeault.com/', '/felixpeault/');
  out = out.replace(/href="\/(?!felixpeault\/)/g, 'href="/felixpeault/');
  out = out.replace(/src="\/(?!felixpeault\/)/g, 'src="/felixpeault/');
  out = out.replace(/href="\.\//g, 'href="/felixpeault/');
  out = out.replace(/src="\.\//g, 'src="/felixpeault/');
  return out;
}

function save(urlPath, buf) {
  const dest = outFileForPath(urlPath);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buf);
}

const queue = new Set(SEED_PATHS);
const done = new Set();
fs.mkdirSync(ROOT, { recursive: true });

while (queue.size) {
  const urlPath = [...queue][0];
  queue.delete(urlPath);
  if (done.has(urlPath)) continue;
  done.add(urlPath);
  try {
    const buf = download(urlPath);
    let toWrite = buf;
    if (urlPath === '/' || urlPath === '/fr') {
      const html = patchHtml(buf.toString('utf8'));
      toWrite = Buffer.from(html, 'utf8');
      for (const p of extractPathsFromHtml(html)) {
        if (!done.has(p)) queue.add(p);
      }
    }
    save(urlPath, toWrite);
    process.stdout.write(`ok ${urlPath}\n`);
  } catch (e) {
    process.stderr.write(`fail ${urlPath}: ${e.message}\n`);
  }
}
