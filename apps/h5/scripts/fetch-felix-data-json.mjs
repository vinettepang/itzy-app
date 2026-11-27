/**
 * 用 Playwright 从线站拉取 __data.json（curl 常被 Cloudflare 拦截）
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../public/felixpeault');
const ROUTES = ['series', 'info', 'journeys'];

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('https://felixpeault.com/', {
  waitUntil: 'domcontentloaded',
  timeout: 120_000,
});
for (const route of ROUTES) {
  const text = await page.evaluate(async (r) => {
    const res = await fetch(`https://felixpeault.com/${r}/__data.json`);
    return res.text();
  }, route);
  if (!text.trim().startsWith('{')) {
    throw new Error(`${route}/__data.json is not JSON (${text.slice(0, 40)})`);
  }
  const dir = path.join(ROOT, route);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, '__data.json'), text);
  console.log('ok', route, text.length);
}
await browser.close();
