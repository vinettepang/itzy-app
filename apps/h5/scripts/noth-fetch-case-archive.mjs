/**
 * 将 noth.in case 页 HTML 保存到 public/noth/_archive-html/works/<slug>/index.html
 * 用法：node scripts/noth-fetch-case-archive.mjs [slug ...]
 * 无参数时从 _archive-html/works/index.html 解析全部 slug。
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ARCHIVE = join(__dirname, '../public/noth/_archive-html');
const BASE = 'https://www.noth.in';

function slugsFromWorksList() {
  const worksPath = join(ARCHIVE, 'works/index.html');
  if (!existsSync(worksPath)) return [];
  const html = readFileSync(worksPath, 'utf8');
  const slugs = new Set();
  const re = /href="\.\/([^"/]+)\/index\.html"/g;
  for (const m of html.matchAll(re)) slugs.add(m[1]);
  return [...slugs];
}

async function capturePage(page, urlPath) {
  const url = urlPath.startsWith('http') ? urlPath : `${BASE}${urlPath}`;
  for (let attempt = 0; attempt < 4; attempt++) {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120_000 });
    await page.waitForTimeout(3000 + attempt * 2000);
    try {
      await page.waitForSelector('.page-wrapper, .nav-boiler, [data-wf-page]', { timeout: 40_000 });
    } catch {
      /* slow / challenge */
    }
    await page.evaluate(async () => {
      for (let i = 0; i < 6; i++) {
        window.scrollBy(0, window.innerHeight * 0.75);
        await new Promise((r) => setTimeout(r, 300));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1500);
    const html = await page.content();
    const cf = /Just a moment|cf-chl|challenge-platform/i.test(html);
    const ok = /page-wrapper|nav-boiler|data-wf-page/i.test(html);
    if (!cf && ok) return html;
    console.warn('retry', url, attempt + 1, cf ? 'cloudflare' : 'no-markers');
  }
  return null;
}

async function main() {
  const argvSlugs = process.argv.slice(2).filter(Boolean);
  const slugs = argvSlugs.length ? argvSlugs : slugsFromWorksList();
  if (!slugs.length) {
    console.error('No slugs. Pass slugs or ensure _archive-html/works/index.html exists.');
    process.exit(1);
  }

  const headed = process.env.NOTH_FETCH_HEADED === '1';
  const browser = await chromium.launch({ headless: !headed });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  });

  let ok = 0;
  for (const slug of slugs) {
    const urlPath = `/works/${slug}`;
    console.log('fetch', urlPath);
    const html = await capturePage(page, urlPath);
    if (!html) {
      console.warn('skip', slug);
      continue;
    }
    const outDir = join(ARCHIVE, 'works', slug);
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, 'index.html'), html, 'utf8');
    console.log('wrote', `works/${slug}/index.html`, html.length);
    ok++;
  }

  await browser.close();
  console.log(`done: ${ok}/${slugs.length} cases in _archive-html`);
  if (ok === 0) {
    console.error(
      'All fetches failed (often Cloudflare). Try: NOTH_FETCH_HEADED=1, mirror:noth:full + sync:noth:archive, or import:noth:case',
    );
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
