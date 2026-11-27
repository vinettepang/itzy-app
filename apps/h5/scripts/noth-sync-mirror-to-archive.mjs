/**
 * 将 mirror-noth-full 写入 public/noth/ 的 HTML 同步到 _archive-html/（供 generate:noth）
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIRROR = join(__dirname, '../public/noth');
const ARCHIVE = join(__dirname, '../public/noth/_archive-html');

function copyHtml(relFromNothRoot, relToArchive) {
  const src = join(MIRROR, relFromNothRoot);
  const dest = join(ARCHIVE, relToArchive);
  if (!existsSync(src)) return false;
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(src, dest);
  console.log('copied', relFromNothRoot, '→', relToArchive);
  return true;
}

function syncWorksCases() {
  const worksDir = join(MIRROR, 'works');
  if (!existsSync(worksDir)) return 0;
  let n = 0;
  for (const name of readdirSync(worksDir)) {
    if (name === 'index.html') continue;
    const caseHtml = join(worksDir, name, 'index.html');
    if (!existsSync(caseHtml) || !statSync(caseHtml).isFile()) continue;
    if (copyHtml(join('works', name, 'index.html'), join('works', name, 'index.html'))) n++;
  }
  return n;
}

function main() {
  mkdirSync(ARCHIVE, { recursive: true });
  copyHtml('index.html', 'index.html');
  copyHtml('works/index.html', 'works/index.html');
  const cases = syncWorksCases();
  console.log(`synced ${cases} case page(s) to _archive-html`);
}

main();
