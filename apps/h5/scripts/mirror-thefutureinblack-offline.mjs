/**
 * The Future in Black (thefutureinblack.com) Squarespace 离线镜像 → public/thefutureinblack/
 *
 * 用法（apps/h5）：
 *   node scripts/mirror-thefutureinblack-offline.mjs
 */
import { createHash } from 'node:crypto';
import {
  mkdirSync,
  writeFileSync,
  readFileSync,
  existsSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchBuffer, fetchText } from './lib/http-fetch.mjs';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE = 'https://www.thefutureinblack.com';
const ROOT = path.join(__dirname, '..', 'public', 'thefutureinblack');
const ASSETS = path.join(ROOT, 'assets');

const ASSET_HOSTS = new Set([
  'www.thefutureinblack.com',
  'thefutureinblack.com',
  'images.squarespace-cdn.com',
  'definitions.sqspcdn.com',
  'static1.squarespace.com',
  'static.squarespace.com',
  'assets.squarespace.com',
  'file.squarespace-cdn.com',
  'tfib.squarespace.com',
  'cdnjs.cloudflare.com',
  'storage.googleapis.com',
]);

const urlToDisk = new Map();
let mirroredPageUrls = [];

function isSitePage(url) {
  try {
    const u = new URL(url);
    return u.hostname === 'www.thefutureinblack.com' || u.hostname === 'thefutureinblack.com';
  } catch {
    return false;
  }
}

function isAssetHost(url) {
  try {
    const u = new URL(url);
    return ASSET_HOSTS.has(u.hostname);
  } catch {
    return false;
  }
}

function sitePathToDiskPath(pathname, search = '') {
  let p = pathname;
  if (p.endsWith('/')) p += 'index';
  if (!path.extname(p)) p += '.html';
  p = p.replace(/^\//, '');
  if (search) {
    const q = createHash('sha1').update(search).digest('hex').slice(0, 8);
    const ext = path.extname(p);
    const base = ext ? p.slice(0, -ext.length) : p;
    p = `${base}--${q}${ext || '.html'}`;
  }
  return path.join(ASSETS, p.split('/').join(path.sep));
}

function extractUrls(text) {
  const out = new Set();
  for (const m of text.matchAll(/https?:\/\/[^"'\\\s<>)]+/gi)) {
    let u = m[0].replace(/&amp;/g, '&').replace(/[)\\]},;'"]+$/g, '');
    out.add(u);
  }
  for (const m of text.matchAll(/(?:src|href)=["'](\/\/[^"'#?]+)["']/gi)) {
    out.add(`https:${m[1]}`);
  }
  for (const m of text.matchAll(/(?:src|href)=["'](\/[^"'#?]+[^"']*)["']/gi)) {
    out.add(new URL(m[1], SITE).href);
  }
  return [...out];
}

function isStaticAssetUrl(absUrl) {
  try {
    const u = new URL(absUrl);
    if (!isAssetHost(absUrl)) return false;
    const p = u.pathname.toLowerCase();
    if (p.includes('/api/') || p.includes('commerce/')) return false;
    if (
      /\.(css|js|mjs|woff2?|ttf|eot|otf|png|jpe?g|gif|webp|svg|ico|mp4|webm|pdf|json|xml)$/i.test(
        p,
      )
    ) {
      return true;
    }
    if (u.hostname.includes('squarespace') || u.hostname.includes('sqspcdn')) return true;
    if (u.hostname === 'cdnjs.cloudflare.com') return true;
    return false;
  } catch {
    return false;
  }
}

async function downloadAsset(absUrl) {
  if (!isStaticAssetUrl(absUrl)) return null;
  if (urlToDisk.has(absUrl)) return urlToDisk.get(absUrl);
  const u = new URL(absUrl);
  const disk = sitePathToDiskPath(u.pathname, u.search);
  urlToDisk.set(absUrl, disk);
  if (!existsSync(disk)) {
    mkdirSync(path.dirname(disk), { recursive: true });
    const buf = await fetchBuffer(absUrl);
    writeFileSync(disk, buf);
    console.log('asset', path.relative(ROOT, disk), buf.length);
  }
  return disk;
}

function rewriteContent(text, htmlDir = ROOT) {
  let out = text;
  const entries = [...urlToDisk.entries()].sort((a, b) => b[0].length - a[0].length);
  for (const [remote, disk] of entries) {
    const fromHtml = path.relative(htmlDir, disk).split(path.sep).join('/');
    const localDot = fromHtml.startsWith('.') ? fromHtml : `./${fromHtml}`;
    out = out.split(remote).join(localDot);
    out = out.split(remote.replace(/&/g, '&amp;')).join(localDot);
    try {
      const u = new URL(remote);
      const protoRelative = `//${u.host}${u.pathname}${u.search}`;
      out = out.split(protoRelative).join(localDot);
    } catch {
      /* ignore */
    }
    const jsonSlash = remote.replace(/\//g, '\\/');
    if (jsonSlash !== remote) {
      out = out.split(jsonSlash).join(localDot.replace(/\//g, '\\/'));
    }
  }
  return out;
}

function stripExternalTrackers(html) {
  let out = html;
  out = out.replace(/<script[^>]*src="[^"]*google-analytics[^"]*"[^>]*>\s*<\/script>/gi, '');
  out = out.replace(/<script[^>]*src="[^"]*googletagmanager[^"]*"[^>]*>\s*<\/script>/gi, '');
  return out;
}

function injectGuard(html) {
  const guard = `<script>(function(){var o=location.origin;function ok(u){try{var x=new URL(u,location.href);return x.origin===o||x.protocol==='data:'||x.protocol==='blob:';}catch(e){return true;}}var f=window.fetch;window.fetch=function(u,init){var s=typeof u==='string'?u:(u&&u.url)||'';if(s&&!ok(s))return Promise.reject(new Error('offline'));return f.apply(this,arguments);};})();</script>`;
  if (html.includes("Error('offline')")) return html;
  return html.replace(/<head(\s[^>]*)?>/i, (m) => `${m}${guard}`);
}

function pageUrlToHtmlFile(pageUrl) {
  const u = new URL(pageUrl);
  if (u.pathname === '/' || u.pathname === '') {
    return path.join(ROOT, 'index.html');
  }
  const dir = path.join(ROOT, u.pathname.replace(/^\//, '').replace(/\/$/, ''));
  return path.join(dir, 'index.html');
}

function pageUrlToLocalRef(pageUrl, fromDir) {
  const outFile = pageUrlToHtmlFile(pageUrl);
  let rel = path.relative(fromDir, outFile).split(path.sep).join('/');
  if (!rel.startsWith('.')) rel = `./${rel}`;
  return rel;
}

function rewriteInternalPageLinks(html, htmlDir) {
  let out = html;
  for (const pageUrl of mirroredPageUrls) {
    const u = new URL(pageUrl);
    const local = pageUrlToLocalRef(pageUrl, htmlDir);
    const targets = new Set([
      pageUrl,
      pageUrl.replace(/\/$/, ''),
      `https://thefutureinblack.com${u.pathname}`,
      `https://thefutureinblack.com${u.pathname.replace(/\/$/, '')}`,
    ]);
    for (const t of targets) {
      if (!t) continue;
      out = out.split(t).join(local);
    }
  }
  const pathLinks = [
    ['href="/home"', pageUrlToLocalRef(`${SITE}/home`, htmlDir)],
    ['href="/forms"', pageUrlToLocalRef(`${SITE}/forms`, htmlDir)],
    ['href="/cart"', pageUrlToLocalRef(`${SITE}/cart`, htmlDir)],
  ];
  for (const [from, to] of pathLinks) {
    if (to) out = out.split(from).join(`href="${to}"`);
  }
  out = out.replace(
    /<a\b([^>]*?)href="https?:\/\/(www\.)?thefutureinblack\.com\/?"([^>]*)>/gi,
    (_, a, _w, b) => {
      const local = pageUrlToLocalRef(`${SITE}/`, htmlDir);
      return `<a${a}href="${local}"${b}>`;
    },
  );
  return out;
}

async function collectAssetsFromText(text) {
  const queue = [];
  for (const u of extractUrls(text)) {
    if (!isAssetHost(u)) continue;
    if (u.includes('/api/') || u.includes('commerce/orders')) continue;
    queue.push(u);
  }
  while (queue.length) {
    const url = queue.shift();
    try {
      const disk = await downloadAsset(url);
      if (!disk) continue;
      await sleep(80);
      if (/\.css$/i.test(disk)) {
        const css = readFileSync(disk, 'utf8');
        for (const u of extractUrls(css)) {
          if (isAssetHost(u) && !urlToDisk.has(u)) queue.push(u);
        }
      }
      if (/\.js$/i.test(disk)) {
        const js = readFileSync(disk, 'utf8');
        for (const u of extractUrls(js)) {
          if (isAssetHost(u) && !urlToDisk.has(u)) queue.push(u);
        }
      }
    } catch (e) {
      console.warn('skip', url, e.message);
    }
  }
}

async function discoverPageUrls() {
  const urls = new Set([`${SITE}/`, `${SITE}/cart`]);
  try {
    const xml = await fetchText(`${SITE}/sitemap.xml`);
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/gi)) {
      const u = m[1].trim();
      if (isSitePage(u)) urls.add(u);
    }
  } catch (e) {
    console.warn('sitemap', e.message);
  }
  return [...urls];
}

async function mirrorPage(pageUrl) {
  console.log('page', pageUrl);
  await sleep(600);
  const html = await fetchText(pageUrl);
  await collectAssetsFromText(html);
  const outFile = pageUrlToHtmlFile(pageUrl);
  mkdirSync(path.dirname(outFile), { recursive: true });
  let out = stripExternalTrackers(html);
  out = out.replace(/<base href="[^"]*">/i, '');
  out = rewriteContent(out, path.dirname(outFile));
  out = rewriteInternalPageLinks(out, path.dirname(outFile));
  out = injectGuard(out);
  writeFileSync(outFile, out, 'utf8');
  console.log('wrote', path.relative(ROOT, outFile));
}

async function rewriteBinaryAssets() {
  for (const [, disk] of urlToDisk.entries()) {
    if (!/\.(css|js)$/i.test(disk)) continue;
    const text = readFileSync(disk, 'utf8');
    writeFileSync(disk, rewriteContent(text, ROOT), 'utf8');
  }
}

async function main() {
  mkdirSync(ASSETS, { recursive: true });
  mirroredPageUrls = await discoverPageUrls();
  for (const p of mirroredPageUrls) {
    try {
      await mirrorPage(p);
    } catch (e) {
      console.warn('page fail', p, e.message);
    }
  }
  await rewriteBinaryAssets();
  writeFileSync(
    path.join(ROOT, 'offline-manifest.json'),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        pages: mirroredPageUrls,
        assets: Object.fromEntries(
          [...urlToDisk.entries()].map(([u, d]) => [u, path.relative(ROOT, d)]),
        ),
      },
      null,
      2,
    ),
  );
  console.log(`Done. ${urlToDisk.size} assets, ${mirroredPageUrls.length} pages.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
