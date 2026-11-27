/**
 * 手动导入 case HTML（绕过 Cloudflare 时在浏览器另存为后使用）
 * 用法：node scripts/noth-import-case-html.mjs <slug> <path-to.html>
 */
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ARCHIVE = join(__dirname, '../public/noth/_archive-html');

const [slug, src] = process.argv.slice(2);
if (!slug || !src) {
  console.error('Usage: node scripts/noth-import-case-html.mjs <slug> <path-to.html>');
  process.exit(1);
}

const destDir = join(ARCHIVE, 'works', slug);
mkdirSync(destDir, { recursive: true });
const dest = join(destDir, 'index.html');
copyFileSync(src, dest);
console.log('imported', src, '→', dest);
console.log('Run: pnpm run generate:noth');
