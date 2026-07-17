import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.resolve(__dirname, '../scratch/index.html'), 'utf8');
const start = html.indexOf('<svg width="311.3"');
const end = html.indexOf('</svg>', start) + '</svg>'.length;
if (start < 0) throw new Error('eyes svg not found');
const outDir = path.resolve(__dirname, '../../apps/h5/src/pages/unseen-studio/assets');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'loader-eyes.svg'), html.slice(start, end));
console.log('wrote', end - start, 'bytes');
