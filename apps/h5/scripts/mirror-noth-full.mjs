/**
 * 完整抓取 noth.in（多页 HTML + 资源）。需 Playwright 绕过 Cloudflare。
 * 用法：node scripts/mirror-noth-full.mjs
 */
import { mkdirSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const NOTH_ROOT = path.join(__dirname, '..', 'public', 'noth');
const BASE = 'https://www.noth.in';

const SEED_PATHS = [
  '/',
  '/works',
  '/studio',
  '/contact',
  '/en',
  '/works/utopia',
  '/works/aurbse',
  '/works/in-cognita',
  '/works/lgm',
  '/works/haptify',
  '/works/mova',
  '/works/france-chimie',
];

function pathToHtmlFile(urlPath) {
  const clean = urlPath.replace(/\/$/, '') || '';
  if (!clean) return path.join(NOTH_ROOT, 'index.html');
  return path.join(NOTH_ROOT, clean.replace(/^\//, ''), 'index.html');
}

function normalizePath(href) {
  if (!href || href.startsWith('#') || href.startsWith('mailto:')) return null;
  try {
    const u = new URL(href, BASE);
    if (u.hostname !== 'www.noth.in' && u.hostname !== 'noth.in') return null;
    let p = u.pathname;
    if (p.endsWith('/')) p = p.slice(0, -1) || '/';
    if (!p.startsWith('/')) p = `/${p}`;
    return p;
  } catch {
    return null;
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  });

  const toVisit = new Set(SEED_PATHS);
  const visited = new Set();

  while (toVisit.size) {
    const urlPath = toVisit.values().next().value;
    toVisit.delete(urlPath);
    if (visited.has(urlPath)) continue;
    visited.add(urlPath);

    const url = urlPath === '/' ? `${BASE}/` : `${BASE}${urlPath}`;
    console.log('capture', url);
    try {
      let html = '';
      for (let attempt = 0; attempt < 4; attempt++) {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120_000 });
        await page.waitForTimeout(4000 + attempt * 3000);
        try {
          await page.waitForSelector('.nav-boiler, [data-wf-page], body.w-mod-js', {
            timeout: 45_000,
          });
        } catch {
          /* challenge or slow */
        }
        await page.evaluate(async () => {
          for (let i = 0; i < 8; i++) {
            window.scrollBy(0, window.innerHeight * 0.8);
            await new Promise((r) => setTimeout(r, 350));
          }
          window.scrollTo(0, 0);
        });
        await page.waitForTimeout(2000);
        html = await page.content();
        const cf = /Just a moment|cf-chl|challenge-platform/i.test(html);
        const ok = /nav-boiler|data-wf-page|class="nav-logo"/i.test(html);
        if (!cf && ok) break;
        console.warn('retry', url, 'attempt', attempt + 1, cf ? 'cf' : 'no-markers');
      }
      if (/Just a moment|cf-chl|challenge-platform/i.test(html)) {
        console.warn('Cloudflare on', url);
        continue;
      }
      if (!/nav-boiler|data-wf-page/i.test(html)) {
        console.warn('skip (not webflow html)', url);
        continue;
      }

      const outFile = pathToHtmlFile(urlPath);
      mkdirSync(path.dirname(outFile), { recursive: true });
      if (!/<base\s/i.test(html)) {
        html = html.replace(/<head(\s[^>]*)?>/i, (m) => `${m}\n<base href="${BASE}/">`);
      }
      writeFileSync(outFile, html, 'utf8');
      console.log('wrote', path.relative(NOTH_ROOT, outFile), html.length);

      const links = await page.evaluate(() =>
        [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')),
      );
      for (const href of links) {
        const p = normalizePath(href);
        if (!p) continue;
        if (p.includes('/cdn-cgi')) continue;
        if (!visited.has(p) && !toVisit.has(p) && visited.size + toVisit.size < 48) {
          toVisit.add(p);
        }
      }
    } catch (e) {
      console.warn('fail', url, e.message);
    }
  }

  await browser.close();
  console.log(`Captured ${visited.size} pages under public/noth/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
