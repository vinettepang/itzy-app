/**
 * 用 Playwright 拉取 noth.in 渲染后的完整 HTML（绕过 Cloudflare）。
 * 用法（apps/h5）：npx playwright@1.51.0 install chromium && node scripts/mirror-noth-home-playwright.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'public', 'noth');
const outFile = path.join(outDir, 'index.html');
const origin = 'https://www.noth.in/';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  viewport: { width: 1440, height: 900 },
});

await page.goto(origin, { waitUntil: 'domcontentloaded', timeout: 120_000 });
await page.waitForTimeout(8000);

let html = await page.content();

if (/Just a moment|cf-chl|challenges\.cloudflare/i.test(html)) {
  console.error('Still on Cloudflare challenge page.');
  await browser.close();
  process.exit(1);
}

if (!/<base\s/i.test(html)) {
  html = html.replace(/<head(\s[^>]*)?>/i, (m) => `${m}\n<base href="${origin}">`);
}

await mkdir(outDir, { recursive: true });
await writeFile(outFile, html, 'utf8');
console.log(`Wrote ${outFile} (${html.length} bytes)`);
await browser.close();
