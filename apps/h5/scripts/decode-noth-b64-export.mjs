import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const exportPath =
  process.argv[2] ??
  'C:/Users/Administrator/.cursor/projects/c-projects-study-vibe-coding-itzy-app-apps-h5/agent-tools/f76226c5-3689-40f4-85aa-2406fc9685c1.txt';
const outFile = path.join(__dirname, '..', 'public', 'noth', 'index.html');
const origin = 'https://www.noth.in/';

const text = readFileSync(exportPath, 'utf8');
const match = text.match(/"([A-Za-z0-9+/=\r\n]{50000,})"/);
if (!match) {
  console.error('Could not find base64 payload in export file');
  process.exit(1);
}
const b64 = match[1].replace(/\s/g, '');
const html = Buffer.from(b64, 'base64').toString('utf8');
if (!html.includes('<html')) {
  console.error('Decoded content does not look like HTML', html.slice(0, 200));
  process.exit(1);
}
let out = html;
if (!/<base\s/i.test(out)) {
  out = out.replace(/<head(\s[^>]*)?>/i, (m) => `${m}\n<base href="${origin}">`);
}
mkdirSync(path.dirname(outFile), { recursive: true });
writeFileSync(outFile, out, 'utf8');
console.log(`Wrote ${outFile} (${out.length} bytes)`);
