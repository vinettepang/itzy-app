/**
 * 收尾：外链策略、dev 加载器兜底（多页）。
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const NOTH_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'noth');

function listHtmlFiles(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) listHtmlFiles(full, acc);
    else if (name.endsWith('.html')) acc.push(full);
  }
  return acc;
}

function assetPrefixForHtml(htmlFile) {
  const relDir = path.relative(NOTH_ROOT, path.dirname(htmlFile));
  if (!relDir || relDir === '.') return './assets/';
  const up = relDir.split(path.sep).map(() => '..').join('/');
  return `${up}/assets/`;
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

function finalizeOne(htmlFile) {
  const prefix = assetPrefixForHtml(htmlFile);
  let html = readFileSync(htmlFile, 'utf8');

  html = html.replace(
    /<script>\s*\(function\(\)\s*\{\s*if \(location\.search\.indexOf\('dev'\)[\s\S]*?localhost:3000\/src\/main\.js';[\s\S]*?\}\)\(\);\s*<\/script>/i,
    `<script type="module" src="${prefix}8cae500c5405-main.js"></script>`,
  );

  html = html.replace(
    /<a\b([^>]*?)href="https?:\/\/(www\.)?noth\.in([^"]*)"([^>]*)>/gi,
    (full, a1, _w, rest, a4) => {
      const p = (rest || '/').split('?')[0].split('#')[0] || '/';
      const rel = relPageLink(htmlFile, p.replace(/\/$/, '') || '/');
      return `<a${a1}href="${rel}"${a4}>`;
    },
  );

  html = html.replace(/<a\b([^>]*?)href="https?:\/\/[^"]*"([^>]*)>/gi, (full) => {
    if (/schema\.org|wikidata|purl\.org|w3\.org|legal\.noth\.in/i.test(full)) return full;
    return full.replace(/href="https?:\/\/[^"]*"/i, 'href="#" data-offline="1"');
  });

  const guard = `<script>(function(){var o=location.origin;function ok(u){try{var x=new URL(u,location.href);return x.origin===o||x.protocol==='data:'||x.protocol==='blob:';}catch(e){return true;}}var f=window.fetch;window.fetch=function(u,init){var s=typeof u==='string'?u:(u&&u.url)||'';if(s&&!ok(s))return Promise.reject(new Error('offline blocked'));return f.apply(this,arguments);};var open=window.open;window.open=function(u){if(u&&!ok(u))return null;return open.apply(this,arguments);};})();</script>`;

  if (!html.includes('offline blocked')) {
    html = html.replace(/<head(\s[^>]*)?>/i, (m) => `${m}${guard}`);
  }

  writeFileSync(htmlFile, html, 'utf8');
  return html.length;
}

const files = listHtmlFiles(NOTH_ROOT);
for (const f of files) {
  const n = finalizeOne(f);
  console.log('Finalized', path.relative(NOTH_ROOT, f), n, 'bytes');
}
