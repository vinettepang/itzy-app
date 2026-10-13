/**
 * 拉取 traumclub.com 首页 HTML 到 public/traumclub/index.html
 * 用法：node scripts/fetch-traumclub-home.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchText } from './lib/http-fetch.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'public', 'traumclub');
const outFile = path.join(outDir, 'index.html');
const url = 'https://traumclub.com/';

const html = await fetchText(url);
await mkdir(outDir, { recursive: true });
await writeFile(outFile, html, 'utf8');
console.log(`Wrote ${outFile} (${html.length} bytes)`);
