import fs from 'node:fs';
import path from 'node:path';

const src = process.argv[2];
const dest = process.argv[3];
if (!src || !dest) {
  console.error('Usage: node patch-felix-html.mjs <input.json|html> <output.html>');
  process.exit(1);
}

let html = fs.readFileSync(src, 'utf8');
if (src.endsWith('.json')) {
  const j = JSON.parse(html);
  html = j.result?.value ?? j.result?.result?.value ?? '';
}
if (!html) throw new Error('empty html');

function patchHtml(out) {
  out = out.replaceAll('https://felixpeault.com/', '/felixpeault/');
  out = out.replace(/href="\/(?!felixpeault\/)/g, 'href="/felixpeault/');
  out = out.replace(/src="\/(?!felixpeault\/)/g, 'src="/felixpeault/');
  out = out.replace(/href="\.\//g, 'href="/felixpeault/');
  out = out.replace(/src="\.\//g, 'src="/felixpeault/');
  out = out.replace(/\s*data-cursor-ref="[^"]*"/g, '');
  out = out.replace(/<html lang="en"[^>]*>/, '<html lang="en">');
  return out;
}

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, patchHtml(html));
console.log('written', dest, html.length);
