/**
 * 从 stdin 读取 Playwright 导出的 HTML（或 base64），写入 public/noth/index.html
 * echo "<html>..." | node scripts/write-noth-html-from-playwright.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outFile = path.join(__dirname, '..', 'public', 'noth', 'index.html');
const origin = 'https://www.noth.in/';

const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);
let raw = Buffer.concat(chunks).toString('utf8').trim();
if (!raw) {
  console.error('No stdin');
  process.exit(1);
}
if (raw.startsWith('{')) {
  try {
    const j = JSON.parse(raw);
    raw = j.html ?? j.data ?? raw;
  } catch {
    /* plain html */
  }
}
let html = raw.startsWith('PD94') || /^[A-Za-z0-9+/=]+$/.test(raw.slice(0, 80))
  ? Buffer.from(raw, 'base64').toString('utf8')
  : raw;

if (!/<base\s/i.test(html)) {
  html = html.replace(/<head(\s[^>]*)?>/i, (m) => `${m}\n<base href="${origin}">`);
}

await mkdir(path.dirname(outFile), { recursive: true });
await writeFile(outFile, html, 'utf8');
console.log(`Wrote ${outFile} (${html.length} bytes)`);
