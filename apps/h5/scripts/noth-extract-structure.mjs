import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const h = readFileSync(join(__dirname, '../public/noth/_archive-html/index.html'), 'utf8');
const pw = h.indexOf('<div class="page-wrapper');
const body = h.indexOf('<body');
const pre = h.slice(body, pw).replace(/^<body[^>]*>/, '').trim();
console.log('pre length', pre.length);
console.log('pre start', pre.slice(0, 600));
console.log('---');
console.log('pre end', pre.slice(-500));
