/**
 * 扫描 public/noth 下全部 index.html，下载外链资源并写回离线版。
 */
import { createHash } from 'node:crypto';
import {
  mkdirSync,
  writeFileSync,
  readFileSync,
  existsSync,
  readdirSync,
  statSync,
} from 'node:fs';
import https from 'node:https';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const NOTH_ROOT = path.join(__dirname, '..', 'public', 'noth');
const ASSETS_DIR = path.join(NOTH_ROOT, 'assets');

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const CAPTURE_HOSTS = [
  'cdn.prod.website-files.com',
  'noth-in.b-cdn.net',
  'nothinv1.netlify.app',
  'ajax.googleapis.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'd3e54v103j8qbb.cloudfront.net',
  'legal.noth.in',
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

function listHtmlFiles(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) listHtmlFiles(full, acc);
    else if (name.endsWith('.html')) acc.push(full);
  }
  return acc;
}

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
  const hash = createHash('sha1').update(url).digest('hex').slice(0, 12);
  const u = new URL(url);
  let base = path.basename(decodeURIComponent(u.pathname)) || 'asset';
  base = base.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 96);
  if (!path.extname(base)) {
    const p = u.pathname.toLowerCase();
    if (p.includes('.css')) base += '.css';
    else if (p.includes('.js')) base += '.js';
    else if (p.includes('.woff2')) base += '.woff2';
    else if (p.includes('.webp')) base += '.webp';
    else if (p.includes('.mp4')) base += '.mp4';
    else if (p.includes('.png')) base += '.png';
    else if (p.includes('.jpg')) base += '.jpg';
    else if (p.includes('.svg')) base += '.svg';
  }
  const file = `${hash}-${base}`;
  urlToFile.set(url, file);
  return file;
}

function fetchBuf(url, redirects = 0, rate = 0) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    lib
      .get(url, { headers: { 'User-Agent': UA, Accept: '*/*' } }, (res) => {
        if (
          [301, 302, 307, 308].includes(res.statusCode) &&
          res.headers.location &&
          redirects < 8
        ) {
          res.resume();
          const next = res.headers.location.startsWith('http')
            ? res.headers.location
            : new URL(res.headers.location, url).href;
          resolve(fetchBuf(next, redirects + 1, rate));
          return;
        }
        if (res.statusCode === 429 && rate < 8) {
          res.resume();
          setTimeout(() => resolve(fetchBuf(url, redirects, rate + 1)), 1500 * (rate + 1));
          return;
        }
        if (res.statusCode !== 200) {
          res.resume();
          reject(new Error(`${res.statusCode}`));
          return;
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks)));
      })
      .on('error', reject);
  });
}

async function download(url) {
  const file = assetFileName(url);
  const dest = path.join(ASSETS_DIR, file);
  if (!existsSync(dest)) {
    const buf = await fetchBuf(url);
    mkdirSync(ASSETS_DIR, { recursive: true });
    writeFileSync(dest, buf);
    console.log('OK', file, buf.length);
  }
  return file;
}

function extractUrls(text) {
  const out = new Set();
  for (const m of text.matchAll(/https?:\/\/[^"'\\\s<>)]+/gi)) {
    let u = m[0].replace(/&amp;/g, '&').replace(/[)\\]},;'"]+$/g, '');
    try {
      const parsed = new URL(u);
      if (!parsed.pathname || parsed.pathname === '/') {
        if (!/\.(css|js|woff2?|webp|jpg|jpeg|png|svg|mp4|gif)(\?|$)/i.test(parsed.hostname)) continue;
      }
    } catch {
      continue;
    }
    out.add(u);
  }
  return [...out];
}

function rewriteText(text, assetPrefix = './assets/') {
  let out = text;
  for (const [remote, file] of [...urlToFile.entries()].sort((a, b) => b[0].length - a[0].length)) {
    const local = `${assetPrefix}${file}`;
    out = out.split(remote).join(local);
    out = out.split(encodeURI(decodeURIComponent(remote))).join(local);
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
  out = out.replace(/<link[^>]+rel="preconnect"[^>]*>/gi, (tag) =>
    /website-files|fonts\.googleapis|gstatic/i.test(tag) ? '' : tag,
  );
  out = out.replace(/<iframe height="1" width="1"[^>]*><\/iframe>/gi, '');
  return out;
}

function assetPrefixForHtml(htmlFile) {
  const relDir = path.relative(NOTH_ROOT, path.dirname(htmlFile));
  if (!relDir || relDir === '.') return './assets/';
  const up = relDir.split(path.sep).map(() => '..').join('/');
  return `${up}/assets/`;
}

function fixMainJsPath(html, htmlFile) {
  const prefix = assetPrefixForHtml(htmlFile);
  const mainFile = [...urlToFile.values()].find((f) => f.includes('main.js')) || '8cae500c5405-main.js';
  return html
    .replace(
      /<script>\s*\(function\(\)\s*\{[\s\S]*?localhost:3000[\s\S]*?\}\)\(\);\s*<\/script>/i,
      `<script type="module" src="${prefix}${mainFile}"></script>`,
    )
    .replace(/src="\.\/assets\/([^"]*main\.js)"/g, `src="${prefix}$1"`);
}

function injectOfflineGuard(html) {
  const guard = `<script>(function(){var o=location.origin;function ok(u){try{var x=new URL(u,location.href);return x.origin===o||x.protocol==='data:'||x.protocol==='blob:';}catch(e){return true;}}var f=window.fetch;window.fetch=function(u,init){var s=typeof u==='string'?u:(u&&u.url)||'';if(s&&!ok(s))return Promise.reject(new Error('offline blocked'));return f.apply(this,arguments);};})();</script>`;
  return html.includes('offline blocked')
    ? html
    : html.replace(/<head(\s[^>]*)?>/i, (m) => `${m}${guard}`);
}

function relPageLink(fromHtmlFile, urlPath) {
  const target =
    urlPath === '/' || urlPath === ''
      ? path.join(NOTH_ROOT, 'index.html')
      : path.join(NOTH_ROOT, urlPath.replace(/^\//, ''), 'index.html');
  let rel = path.relative(path.dirname(fromHtmlFile), target).split(path.sep).join('/');
  if (!rel.startsWith('.')) rel = `./${rel}`;
  return rel;
}

function fixInternalNav(html, htmlFile) {
  return html.replace(/href="(\/[^"'#?]*)"/g, (match, urlPath) => {
    if (urlPath.startsWith('//')) return match;
    const rel = relPageLink(htmlFile, urlPath.replace(/\/$/, '') || '/');
    return `href="${rel}"`;
  });
}

async function main() {
  const htmlFiles = listHtmlFiles(NOTH_ROOT);
  if (!htmlFiles.length) {
    console.error('No HTML in', NOTH_ROOT);
    process.exit(1);
  }

  const queue = new Set();
  for (const file of htmlFiles) {
    for (const u of extractUrls(readFileSync(file, 'utf8'))) {
      if (shouldCapture(u)) queue.add(u);
    }
  }

  while (queue.size) {
    const url = queue.values().next().value;
    queue.delete(url);
    try {
      await download(url);
      const file = urlToFile.get(url);
      const full = path.join(ASSETS_DIR, file);
      if (/\.css$/i.test(file)) {
        for (const next of extractUrls(readFileSync(full, 'utf8'))) {
          if (shouldCapture(next) && !urlToFile.has(next)) queue.add(next);
        }
      }
      if (/\.js$/i.test(file)) {
        for (const next of extractUrls(readFileSync(full, 'utf8'))) {
          if (shouldCapture(next) && !urlToFile.has(next)) queue.add(next);
        }
      }
    } catch (e) {
      console.warn('FAIL', url, e.message);
    }
  }

  for (const [url, file] of urlToFile.entries()) {
    if (!/\.(css|js)$/i.test(file)) continue;
    const full = path.join(ASSETS_DIR, file);
    writeFileSync(full, rewriteText(readFileSync(full, 'utf8')), 'utf8');
  }

  for (const htmlFile of htmlFiles) {
    const assetPrefix = assetPrefixForHtml(htmlFile);
    let html = readFileSync(htmlFile, 'utf8');
    html = stripBlockedScripts(html);
    html = html.replace(/<base href="[^"]*">\s*/i, '');
    html = rewriteText(html, assetPrefix);
    html = fixMainJsPath(html, htmlFile);
    html = fixInternalNav(html, htmlFile);
    html = injectOfflineGuard(html);
    writeFileSync(htmlFile, html, 'utf8');
    console.log('offline', path.relative(NOTH_ROOT, htmlFile));
  }

  writeFileSync(
    path.join(NOTH_ROOT, 'offline-manifest.json'),
    JSON.stringify(
      { generatedAt: new Date().toISOString(), pages: htmlFiles.map((f) => path.relative(NOTH_ROOT, f)), assets: Object.fromEntries(urlToFile) },
      null,
      2,
    ),
  );
  console.log(`Done ${urlToFile.size} assets, ${htmlFiles.length} pages`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
