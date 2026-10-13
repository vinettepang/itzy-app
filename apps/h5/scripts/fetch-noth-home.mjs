/**
 * @deprecated 原站 Cloudflare 会 403。请用 Playwright 镜像：
 *   pnpm add -D playwright && npx playwright install chromium
 *   node scripts/mirror-noth-home-playwright.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import https from 'node:https';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'public', 'noth');
const outFile = path.join(outDir, 'index.html');
const pageUrl = 'https://www.noth.in/?ref=siteinspire';

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      },
      (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const next = new URL(res.headers.location, url).href;
          res.resume();
          resolve(fetchHtml(next));
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`Failed ${res.statusCode}`));
          res.resume();
          return;
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
        res.on('error', reject);
      },
    );
    req.on('error', reject);
  });
}

let html;
try {
  html = await fetchHtml(pageUrl);
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  console.error(
    'Tip: open https://www.noth.in/ in a browser, save page as public/noth/index.html, then use /noth?snapshot=1',
  );
  process.exit(1);
}

if (/Just a moment|cf-chl|challenges\.cloudflare/i.test(html)) {
  console.error('Received Cloudflare challenge page, not real HTML. Use browser save instead.');
  process.exit(1);
}

if (!/<base\s/i.test(html)) {
  html = html.replace(/<head(\s[^>]*)?>/i, (m) => `${m}\n<base href="https://www.noth.in/">`);
}

await mkdir(outDir, { recursive: true });
await writeFile(outFile, html, 'utf8');
console.log(`Wrote ${outFile} (${html.length} bytes)`);
