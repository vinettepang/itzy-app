/**
 * 离线镜像：Playwright 打开 noth.in，拦截并保存所有关键资源，重写 index.html。
 * 用法（apps/h5）：node scripts/mirror-noth-offline.mjs
 */
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const NOTH_ROOT = path.join(__dirname, '..', 'public', 'noth');
const HTML_FILE = path.join(NOTH_ROOT, 'index.html');
const ASSETS_DIR = path.join(NOTH_ROOT, 'assets');
const MANIFEST_FILE = path.join(NOTH_ROOT, 'offline-manifest.json');

const ORIGIN = 'https://www.noth.in/';

const CAPTURE_HOSTS = [
  'cdn.prod.website-files.com',
  'noth-in.b-cdn.net',
  'nothinv1.netlify.app',
  'ajax.googleapis.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'd3e54v103j8qbb.cloudfront.net',
  'legal.noth.in',
  'uploads-ssl.webflow.com',
];

const BLOCK_SUBSTR = [
  'googletagmanager.com',
  'google-analytics.com',
  'tracker.metricool.com',
  'snap.licdn.com',
  'cdn.brevo.com',
  'tools.noth.in',
  'n8n.noth.in',
  'challenges.cloudflare.com',
  '/cdn-cgi/challenge-platform/',
];

const urlToFile = new Map();

function shouldCapture(url) {
  try {
    const h = new URL(url).hostname;
    return CAPTURE_HOSTS.some((d) => h === d || h.endsWith(`.${d}`));
  } catch {
    return false;
  }
}

function assetFileName(url) {
  if (urlToFile.has(url)) return urlToFile.get(url);
  const u = new URL(url);
  const hash = createHash('sha1').update(url).digest('hex').slice(0, 12);
  let base = path.basename(decodeURIComponent(u.pathname)) || 'asset';
  base = base.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 96);
  if (!path.extname(base)) {
    const q = u.pathname.toLowerCase();
    if (q.includes('.css') || url.includes('text/css')) base += '.css';
    else if (q.includes('.js')) base += '.js';
    else if (q.includes('.woff2')) base += '.woff2';
    else if (q.includes('.woff')) base += '.woff';
    else if (q.includes('.webp')) base += '.webp';
    else if (q.includes('.mp4')) base += '.mp4';
    else if (q.includes('.png')) base += '.png';
    else if (q.includes('.jpg') || q.includes('.jpeg')) base += '.jpg';
    else if (q.includes('.svg')) base += '.svg';
  }
  const file = `${hash}-${base}`;
  urlToFile.set(url, file);
  return file;
}

function rewriteText(text) {
  let out = text;
  const entries = [...urlToFile.entries()].sort((a, b) => b[0].length - a[0].length);
  for (const [remote, file] of entries) {
    const local = `./assets/${file}`;
    out = out.split(remote).join(local);
    const enc = remote.replace(/ /g, '%20');
    if (enc !== remote) out = out.split(enc).join(local);
  }
  return out;
}

function stripBlockedScripts(html) {
  let out = html;
  out = out.replace(/<script\b[^>]*\bsrc="([^"]+)"[^>]*>\s*<\/script>/gi, (full, src) => {
    if (BLOCK_SUBSTR.some((b) => src.includes(b))) return '';
    if (/^https?:\/\/localhost/i.test(src)) return '';
    return full;
  });
  out = out.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (block) => {
    if (BLOCK_SUBSTR.some((b) => block.includes(b))) return '';
    if (block.includes('__CF$cv$params')) return '';
    if (block.includes('nothinLoadTrackers')) return '';
    if (block.includes('NothinChatConfigEndpoint')) return '';
    if (block.includes('GTM-TXXTT3WJ')) return '';
    return block;
  });
  out = out.replace(/<noscript>[\s\S]*?googletagmanager[\s\S]*?<\/noscript>/gi, '');
  out = out.replace(/<link[^>]+rel="preconnect"[^>]*>/gi, (tag) => {
    if (/fonts\.googleapis|website-files|gstatic/i.test(tag)) return '';
    return tag;
  });
  out = out.replace(/<iframe[^>]*googletagmanager[\s\S]*?<\/iframe>/gi, '');
  out = out.replace(/<iframe height="1" width="1"[^>]*><\/iframe>/gi, '');
  return out;
}

function injectOfflineGuard(html) {
  const guard = `<script>(function(){var o=location.origin;function ok(u){try{var x=new URL(u,location.href);return x.origin===o||x.protocol==='data:'||x.protocol==='blob:';}catch(e){return true;}}var f=window.fetch;window.fetch=function(u,init){var s=typeof u==='string'?u:(u&&u.url)||'';if(s&&!ok(s))return Promise.reject(new Error('offline blocked'));return f.apply(this,arguments);};})();</script>`;
  if (html.includes('offline blocked')) return html;
  return html.replace(/<head(\s[^>]*)?>/i, (m) => `${m}${guard}`);
}

async function processCssFiles() {
  for (const [url, file] of urlToFile.entries()) {
    if (!/\.css$/i.test(file)) continue;
    const full = path.join(ASSETS_DIR, file);
    if (!existsSync(full)) continue;
    let css = readFileSync(full, 'utf8');
    const urls = [...css.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/gi)].map((m) => m[1]);
    for (const ref of urls) {
      if (!ref.startsWith('http')) continue;
      if (!shouldCapture(ref)) continue;
      if (!urlToFile.has(ref)) continue;
    }
    css = rewriteText(css);
    writeFileSync(full, css, 'utf8');
  }
}

async function main() {
  mkdirSync(ASSETS_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  });

  page.on('response', async (response) => {
    const url = response.url();
    if (response.status() !== 200) return;
    if (!shouldCapture(url)) return;
    try {
      const body = await response.body();
      const file = assetFileName(url);
      const dest = path.join(ASSETS_DIR, file);
      if (!existsSync(dest)) {
        writeFileSync(dest, body);
        console.log('saved', file, body.length);
      }
      urlToFile.set(url, file);
    } catch (e) {
      console.warn('body', url, e.message);
    }
  });

  await page.goto(ORIGIN, { waitUntil: 'domcontentloaded', timeout: 120_000 });
  await page.waitForTimeout(6000);
  await page.evaluate(async () => {
    const step = () => window.scrollBy(0, window.innerHeight * 0.85);
    for (let i = 0; i < 12; i++) {
      step();
      await new Promise((r) => setTimeout(r, 400));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(4000);

  let html = await page.content();
  if (/Just a moment|cf-chl/i.test(html)) {
    await browser.close();
    console.error('Cloudflare challenge — retry later or use decode export HTML first.');
    process.exit(1);
  }

  await browser.close();

  html = stripBlockedScripts(html);
  html = html.replace(/<base href="[^"]*">/i, '<base href="./">');
  html = rewriteText(html);
  html = injectOfflineGuard(html);

  writeFileSync(HTML_FILE, html, 'utf8');
  await processCssFiles();

  const html2 = readFileSync(HTML_FILE, 'utf8');
  const finalHtml = rewriteText(stripBlockedScripts(html2));
  writeFileSync(HTML_FILE, injectOfflineGuard(finalHtml), 'utf8');

  writeFileSync(
    MANIFEST_FILE,
    JSON.stringify(
      { generatedAt: new Date().toISOString(), assets: Object.fromEntries(urlToFile) },
      null,
      2,
    ),
  );

  console.log(`Offline mirror: ${urlToFile.size} assets → ${ASSETS_DIR}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
