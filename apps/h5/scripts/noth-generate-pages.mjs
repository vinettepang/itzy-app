/**
 * 从归档 HTML 生成 Noth React 用的 HTML 片段（chrome + page body）
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ARCHIVE = join(__dirname, '../public/noth/_archive-html');
const OUT = join(__dirname, '../src/pages/noth/generated');

const PAGES = [
  { file: 'index.html', exportName: 'NOTH_HOME_PAGE_HTML' },
  { file: 'works/index.html', exportName: 'NOTH_WORKS_PAGE_HTML' },
];

function extractChrome(html) {
  const pw = html.indexOf('<div class="page-wrapper');
  if (pw < 0) throw new Error('page-wrapper not found');
  const body = html.indexOf('<body');
  if (body < 0) throw new Error('body not found');
  return html.slice(body, pw).replace(/^<body[^>]*>/, '').trim();
}

function extractPageWrapper(html) {
  const start = html.indexOf('<div class="page-wrapper');
  if (start < 0) throw new Error('page-wrapper not found');
  let depth = 0;
  let i = start;
  const open = '<div';
  const close = '</div>';
  while (i < html.length) {
    if (html.startsWith(open, i)) {
      depth++;
      i += open.length;
      continue;
    }
    if (html.startsWith(close, i)) {
      depth--;
      i += close.length;
      if (depth === 0) return html.slice(start, i);
      continue;
    }
    i++;
  }
  throw new Error('Could not close page-wrapper');
}

/** 从 works 列表归档建立 title aria-label → slug */
function buildWorkSlugIndex(archiveDir) {
  const worksPath = join(archiveDir, 'works/index.html');
  if (!existsSync(worksPath)) return new Map();
  const html = readFileSync(worksPath, 'utf8');
  const map = new Map();
  const re =
    /class="work_item[\s\S]*?title-work"[^>]*aria-label="([^"]+)"[\s\S]*?href="\.\/([^"/]+)\/index\.html"/g;
  for (const match of html.matchAll(re)) {
    map.set(match[1], match[2]);
  }
  return map;
}

function wireHomeWorkLinks(homeHtml, labelToSlug) {
  if (!labelToSlug.size) return homeHtml;
  return homeHtml.replace(
    /(class="work_item[\s\S]*?title-work"[^>]*aria-label="([^"]+)"[\s\S]*?<a )href="#"/g,
    (full, prefix, label) => {
      const slug = labelToSlug.get(label);
      if (!slug) return full;
      return `${prefix}href="/noth/works/${slug}" data-transition="flip"`;
    },
  );
}

function discoverCasePages(archiveDir) {
  const worksDir = join(archiveDir, 'works');
  if (!existsSync(worksDir)) return [];
  return readdirSync(worksDir)
    .filter((name) => {
      if (name === 'index.html') return false;
      const p = join(worksDir, name, 'index.html');
      return existsSync(p) && statSync(p).isFile();
    })
    .map((slug) => ({ slug, file: `works/${slug}/index.html` }));
}

function transformHtml(html) {
  let s = html;
  s = s.replace(/\.\/assets\//g, '/noth/assets/');
  s = s.replace(/\.\.\/assets\//g, '/noth/assets/');
  s = s.replace(/href="\.\/index\.html"/g, 'href="/noth" data-taxi-ignore');
  s = s.replace(/href="\.\/works\/index\.html"/g, 'href="/noth/works" data-taxi-ignore');
  s = s.replace(/href="\.\.\/index\.html"/g, 'href="/noth" data-taxi-ignore');
  s = s.replace(/href="\.\.\/works\/index\.html"/g, 'href="/noth/works" data-taxi-ignore');
  s = s.replace(/href="\/works"/g, 'href="/noth/works" data-taxi-ignore');
  s = s.replace(/href="\/"/g, 'href="/noth" data-taxi-ignore');
  s = s.replace(/href="\.\/([^"/]+)\/index\.html"/g, 'href="/noth/works/$1" data-transition="flip"');
  s = s.replace(/\.\/noth\/assets\//g, '/noth/assets/');
  s = s.replace(/<canvas class="mask-reveal-canvas"[^>]*><\/canvas>/g, '');
  s = s.replace(/<canvas class="mask-reveal-canvas"[^>]*\/>/g, '');
  s = s.replace(/\sdata-reveal-init="1"/g, '');
  s = s.replace(/\sstyle="[^"]*"/g, '');
  return s;
}

function toTsExport(name, html) {
  const escaped = html.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
  return `/* eslint-disable */\n// AUTO-GENERATED — run: node scripts/noth-generate-pages.mjs\nexport const ${name} = \`${escaped}\`;\n`;
}

function writeCasePagesIndex(slugs) {
  const entries = slugs
    .map((slug) => `  ${JSON.stringify(slug)}: NOTH_CASE_${slug.replace(/[^a-zA-Z0-9_]/g, '_')}_HTML,`)
    .join('\n');
  const imports = slugs
    .map(
      (slug) =>
        `import { NOTH_CASE_${slug.replace(/[^a-zA-Z0-9_]/g, '_')}_HTML } from './NOTH_CASE_${slug.replace(/[^a-zA-Z0-9_]/g, '_')}_HTML';`,
    )
    .join('\n');
  const body = slugs.length
    ? `${imports}\n\nexport const NOTH_CASE_PAGES: Record<string, string> = {\n${entries}\n};\n`
    : `export const NOTH_CASE_PAGES: Record<string, string> = {};\n`;
  writeFileSync(join(OUT, 'NOTH_CASE_PAGES.ts'), `/* eslint-disable */\n// AUTO-GENERATED\n${body}`);
}

function main() {
  mkdirSync(OUT, { recursive: true });
  const indexPath = join(ARCHIVE, 'index.html');
  if (!existsSync(indexPath)) {
    console.warn('skip: no index.html');
    return;
  }
  const workSlugs = buildWorkSlugIndex(ARCHIVE);
  const indexHtml = readFileSync(indexPath, 'utf8');
  const chrome = transformHtml(extractChrome(indexHtml));
  writeFileSync(join(OUT, 'nothChrome.html.ts'), toTsExport('NOTH_CHROME_HTML', chrome));
  console.log('wrote NOTH_CHROME_HTML', chrome.length);

  for (const { file, exportName } of PAGES) {
    const path = join(ARCHIVE, file);
    if (!existsSync(path)) {
      console.warn('skip missing', path);
      continue;
    }
    const html = readFileSync(path, 'utf8');
    let wrapper = transformHtml(extractPageWrapper(html));
    if (file === 'index.html') wrapper = wireHomeWorkLinks(wrapper, workSlugs);
    writeFileSync(join(OUT, `${exportName}.ts`), toTsExport(exportName, wrapper));
    console.log('wrote', exportName, wrapper.length);
  }

  const caseSlugs = [];
  for (const { slug, file } of discoverCasePages(ARCHIVE)) {
    const path = join(ARCHIVE, file);
    const html = readFileSync(path, 'utf8');
    const wrapper = transformHtml(extractPageWrapper(html));
    const safe = slug.replace(/[^a-zA-Z0-9_]/g, '_');
    const exportName = `NOTH_CASE_${safe}_HTML`;
    writeFileSync(join(OUT, `${exportName}.ts`), toTsExport(exportName, wrapper));
    caseSlugs.push(slug);
    console.log('wrote', exportName, wrapper.length);
  }
  writeCasePagesIndex(caseSlugs);
  console.log('wrote NOTH_CASE_PAGES', caseSlugs.length, 'cases');
}

main();
