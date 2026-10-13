/**
 * 将 public/thefutureinblack 内 HTML 中的协议相对 CDN 链接写回本地 assets。
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', 'public', 'thefutureinblack');
const manifestPath = path.join(ROOT, 'offline-manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

function walkHtml(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) walkHtml(full, out);
    else if (name.endsWith('.html')) out.push(full);
  }
  return out;
}

function localRef(fromDir, assetRel) {
  const disk = path.join(ROOT, assetRel);
  let rel = path.relative(fromDir, disk).split(path.sep).join('/');
  if (!rel.startsWith('.')) rel = `./${rel}`;
  return rel;
}

const replacements = [];
for (const [remote, rel] of Object.entries(manifest.assets)) {
  const u = new URL(remote);
  const protoRelative = `//${u.host}${u.pathname}${u.search}`;
  replacements.push({ remote, protoRelative, rel });
}
replacements.sort((a, b) => b.remote.length - a.remote.length);

for (const htmlFile of walkHtml(ROOT)) {
  const dir = path.dirname(htmlFile);
  let html = readFileSync(htmlFile, 'utf8');
  let changed = false;
  for (const { remote, protoRelative, rel } of replacements) {
    const local = localRef(dir, rel);
    if (html.includes(remote)) {
      html = html.split(remote).join(local);
      changed = true;
    }
    if (html.includes(protoRelative)) {
      html = html.split(protoRelative).join(local);
      changed = true;
    }
    const ampRemote = remote.replace(/&/g, '&amp;');
    if (html.includes(ampRemote)) {
      html = html.split(ampRemote).join(local);
      changed = true;
    }
  }
  html = html.replace(/https:\/definitions\.sqspcdn\.com/g, 'https://definitions.sqspcdn.com');
  if (changed || html !== readFileSync(htmlFile, 'utf8')) {
    writeFileSync(htmlFile, html, 'utf8');
    console.log('patched', path.relative(ROOT, htmlFile));
  }
}
