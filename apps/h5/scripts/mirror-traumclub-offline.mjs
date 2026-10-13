/**
 * Traum Club (traumclub.com) 离线镜像：拉取 HTML 页面 + 同域静态资源到 public/traumclub/
 *
 * 用法（apps/h5）：
 *   node scripts/mirror-traumclub-offline.mjs
 *   node scripts/mirror-traumclub-offline.mjs --pages=home,news
 */
import { createHash } from 'node:crypto';
import {
  mkdirSync,
  writeFileSync,
  readFileSync,
  existsSync,
  statSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchBuffer, fetchText } from './lib/http-fetch.mjs';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE = 'https://traumclub.com';
const ROOT = path.join(__dirname, '..', 'public', 'traumclub');
const ASSETS = path.join(ROOT, 'assets');

const args = process.argv.slice(2);
const pagesArg = args.find((a) => a.startsWith('--pages='));
const pageSlugs = pagesArg
  ? pagesArg.replace('--pages=', '').split(',').map((s) => s.trim())
  : null;

const urlToDisk = new Map();

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

function assetUrlToLocalRef(absUrl) {
  const disk = urlToDisk.get(absUrl);
  if (!disk) return absUrl;
  const rel = path.relative(ROOT, disk).split(path.sep).join('/');
  return `./${rel}`;
}

function extractUrls(text) {
  const out = new Set();
  for (const m of text.matchAll(/https?:\/\/[^"'\\\s<>)]+/gi)) {
    let u = m[0].replace(/&amp;/g, '&').replace(/[)\\]},;'"]+$/g, '');
    out.add(u);
  }
  for (const m of text.matchAll(/(?:src|href)=["'](\/[^"'#?]+[^"']*)["']/gi)) {
    out.add(new URL(m[1], SITE).href);
  }
  return [...out];
}

function isTraumAsset(url) {
  try {
    const u = new URL(url);
    return u.hostname === 'traumclub.com' || u.hostname === 'www.traumclub.com';
  } catch {
    return false;
  }
}

function isStaticAssetUrl(absUrl) {
  const u = new URL(absUrl);
  const p = u.pathname.toLowerCase();
  if (p.includes('/wp-json/') || p.includes('admin-ajax') || p.includes('admin-post')) {
    return false;
  }
  if (/\.(css|js|woff2?|ttf|eot|png|jpe?g|gif|webp|svg|ico|mp4|webm|pdf)$/i.test(p)) {
    return true;
  }
  if (p.includes('/wp-content/') || p.includes('/wp-includes/')) return true;
  return false;
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
    const fromRoot = `./${path.relative(ROOT, disk).split(path.sep).join('/')}`;
    const fromHtml = path
      .relative(htmlDir, disk)
      .split(path.sep)
      .join('/');
    const localDot = fromHtml.startsWith('.') ? fromHtml : `./${fromHtml}`;
    out = out.split(remote).join(localDot);
    out = out.split(remote.replace(/&/g, '&amp;')).join(localDot);
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

async function collectAssetsFromText(text) {
  const queue = [];
  for (const u of extractUrls(text)) {
    if (!isTraumAsset(u)) continue;
    if (u.includes('/wp-json/') || u.includes('xmlrpc') || u.includes('/feed')) continue;
    queue.push(u);
  }
  while (queue.length) {
    const url = queue.shift();
    try {
      const disk = await downloadAsset(url);
      if (!disk) continue;
      await sleep(120);
      if (/\.css$/i.test(disk)) {
        const css = readFileSync(disk, 'utf8');
        for (const u of extractUrls(css)) {
          if (isTraumAsset(u) && !urlToDisk.has(u)) queue.push(u);
        }
      }
      if (/\.js$/i.test(disk)) {
        const js = readFileSync(disk, 'utf8');
        for (const u of extractUrls(js)) {
          if (isTraumAsset(u) && !urlToDisk.has(u)) queue.push(u);
        }
      }
    } catch (e) {
      console.warn('skip', url, e.message);
    }
  }
}

async function discoverPageUrls() {
  if (pageSlugs) {
    return pageSlugs.map((slug) => {
      if (slug === 'home') return `${SITE}/`;
      return `${SITE}/${slug.replace(/^\//, '')}/`;
    });
  }
  const urls = new Set([`${SITE}/`]);
  try {
    const xml = await fetchText(`${SITE}/wp-sitemap.xml`);
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/gi)) {
      const u = m[1].trim();
      if (isTraumAsset(u) && !u.includes('/wp-json/') && !u.includes('/author/')) {
        urls.add(u);
      }
    }
  } catch (e) {
    console.warn('sitemap', e.message);
  }
  const home = existsSync(path.join(ROOT, 'index.html'))
    ? readFileSync(path.join(ROOT, 'index.html'), 'utf8')
    : '';
  for (const u of extractUrls(home)) {
    if (isTraumAsset(u) && /\/(news|about|contact|info)/i.test(u)) urls.add(u);
  }
  return [...urls].slice(0, 40);
}

function pageUrlToHtmlFile(pageUrl) {
  const u = new URL(pageUrl);
  if (u.pathname === '/' || u.pathname === '') {
    return path.join(ROOT, 'index.html');
  }
  const dir = path.join(ROOT, u.pathname.replace(/^\//, '').replace(/\/$/, ''));
  return path.join(dir, 'index.html');
}

async function mirrorPage(pageUrl) {
  console.log('page', pageUrl);
  await sleep(800);
  const html = await fetchText(pageUrl);
  await collectAssetsFromText(html);
  const outFile = pageUrlToHtmlFile(pageUrl);
  mkdirSync(path.dirname(outFile), { recursive: true });
  let out = stripExternalTrackers(html);
  out = out.replace(/<base href="[^"]*">/i, '');
  out = rewriteContent(out, path.dirname(outFile));
  out = injectGuard(out);
  writeFileSync(outFile, out, 'utf8');
  console.log('wrote', path.relative(ROOT, outFile));
}

async function rewriteBinaryAssets() {
  for (const [url, disk] of urlToDisk.entries()) {
    if (!/\.(css|js)$/i.test(disk)) continue;
    const text = readFileSync(disk, 'utf8');
    writeFileSync(disk, rewriteContent(text, ROOT), 'utf8');
  }
}

async function main() {
  mkdirSync(ASSETS, { recursive: true });
  const pages = await discoverPageUrls();
  for (const p of pages) {
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
        pages,
        assets: Object.fromEntries(
          [...urlToDisk.entries()].map(([u, d]) => [u, path.relative(ROOT, d)]),
        ),
      },
      null,
      2,
    ),
  );
  console.log(`Done. ${urlToDisk.size} assets, ${pages.length} pages.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
