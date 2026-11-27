import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexPath = path.resolve(__dirname, '../public/felixpeault/index.html');

let html = fs.readFileSync(indexPath, 'utf8');
html = html.replace(/\s*data-cursor-ref="[^"]*"/g, '');
html = html.replace(/<html lang="en"[^>]*>/, '<html lang="en">');
fs.writeFileSync(indexPath, html);
console.log('sanitized', indexPath);
