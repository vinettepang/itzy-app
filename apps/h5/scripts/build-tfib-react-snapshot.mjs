/**
 * 从 Squarespace 镜像 HTML 提取 React 宿主所需快照（完整 DOM + 尾部脚本）。
 * 用法：node scripts/build-tfib-react-snapshot.mjs
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, '..', 'public', 'thefutureinblack');
const ASSET_PREFIX = '/thefutureinblack/assets/';

const PAGES = [
  { id: 'home', file: path.join(PUBLIC, 'home', 'index.html'), assetBase: '../assets/' },
  { id: 'forms', file: path.join(PUBLIC, 'forms', 'index.html'), assetBase: '../assets/' },
  { id: 'index', file: path.join(PUBLIC, 'index.html'), assetBase: './assets/' },
];

function repairMirrorTypos(html) {
  return html
    .replace(/scripts-compressed\/index\.html/g, 'scripts-compressed/')
    .replace(/styles-compressed\/index\.html/g, 'styles-compressed/')
    .replace(/\/scripts\/index\.html/g, '/scripts/')
    .replace(/versioned-assets\/index\.html/g, 'versioned-assets/');
}

function rewriteHtml(html, assetBase) {
  let out = repairMirrorTypos(html);
  out = out.split(assetBase).join(ASSET_PREFIX);
  out = out.replace(/href="\/s\/(plugin-lightbox\.css)"/g, `href="${ASSET_PREFIX}s/$1"`);
  out = out.replace(/src="\/s\/(plugin-lightbox\.js)"/g, `src="${ASSET_PREFIX}s/$1"`);
  out = out.replace(/href="\.\.\/forms\/index\.html"/g, 'href="/thefutureinblack/forms"');
  out = out.replace(/href="\.\.\/cart\/index\.html"/g, 'href="/thefutureinblack/cart"');
  out = out.replace(/href="\.\.\/index\.html"/g, 'href="/thefutureinblack"');
  out = out.replace(/href="\.\.\/home\/index\.html"/g, 'href="/thefutureinblack"');
  return out;
}

function extractPage({ id, file, assetBase }) {
  const html = readFileSync(file, 'utf8');
  const bodyMatch = html.match(/<body[^>]*class="([^"]*)"[^>]*>/i);
  const bodyClass = bodyMatch
    ? bodyMatch[1].replace(/\s+/g, ' ').trim()
    : 'homepage sqs-seven-one';

  const stylesheets = [
    ...html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/gi),
  ].map((m) => m[1]);

  const squarestylistCss = html.match(
    /<link[^>]+href=["']([^"']*squarestylist\/abundlemanagersq\.css)["']/i,
  )?.[1];
  if (squarestylistCss && !stylesheets.includes(squarestylistCss)) {
    stylesheets.push(squarestylistCss);
  }

  const headInlineStyles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map((m) => m[1])
    .filter((s) => s.length < 500_000);

  const staticContext = html.match(
    /<script data-name="static-context">([\s\S]*?)<\/script>/i,
  )?.[1];

  const siteStart = html.search(/<div[^>]*\sid=["']siteWrapper["']/i);
  if (siteStart < 0) throw new Error(`siteWrapper not found in ${file}`);
  const siteOpenEnd = html.indexOf('>', siteStart) + 1;
  const tailMarker = html.search(
    /<script defer(?:="true")?[^>]+src=["'][^"']*site-bundle[^"']*["']/i,
  );
  if (tailMarker < 0) {
    throw new Error(`site-bundle script not found in ${file}`);
  }
  const siteInner = html.slice(siteOpenEnd, html.lastIndexOf('</div>', tailMarker));

  const tailEnd = html.indexOf('</body>', tailMarker);
  const tailRaw = html.slice(tailMarker, tailEnd);

  const outDir = path.join(PUBLIC, 'snapshots', id);
  mkdirSync(outDir, { recursive: true });

  writeFileSync(path.join(outDir, 'site-inner.html'), rewriteHtml(siteInner, assetBase), 'utf8');
  writeFileSync(path.join(outDir, 'tail.html'), rewriteHtml(tailRaw, assetBase), 'utf8');
  writeFileSync(
    path.join(outDir, 'manifest.json'),
    JSON.stringify(
      {
        id,
        bodyClass,
        stylesheets: stylesheets.map((h) => rewriteHtml(h, assetBase)),
        headInlineStyles: headInlineStyles.map((s) => rewriteHtml(s, assetBase)),
        hasStaticContext: Boolean(staticContext),
      },
      null,
      2,
    ),
    'utf8',
  );
  if (staticContext) {
    writeFileSync(
      path.join(outDir, 'static-context.js'),
      rewriteHtml(staticContext, assetBase),
      'utf8',
    );
  }
  console.log('snapshot', id, 'styles', stylesheets.length, 'inner', siteInner.length);
}

for (const p of PAGES) {
  extractPage(p);
}
