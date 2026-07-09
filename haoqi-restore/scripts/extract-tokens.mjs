/**
 * Extract design tokens & structure from downloaded assets into concise reports.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const assets = join(__dirname, '..', 'assets');
const out = join(__dirname, '..', 'analysis');
mkdirSync(out, { recursive: true });

const css = readFileSync(join(assets, 'styles.css'), 'utf8');
const html = readFileSync(join(assets, 'index.html'), 'utf8');

// --- CSS: @font-face ---
const fontFaces = [...css.matchAll(/@font-face\{[^}]*\}/g)].map((m) => m[0]);

// --- CSS: custom properties (design tokens) ---
const rootBlocks = [...css.matchAll(/(:root|@theme[^{]*|\.dark|\[data-theme[^\]]*\])\s*\{([^}]*)\}/g)]
  .map((m) => `${m[1].trim()} {\n  ${m[2].replace(/;/g, ';\n  ').trim()}\n}`);

// --- CSS: color-ish variable definitions anywhere ---
const varDefs = [...new Set([...css.matchAll(/--[\w-]+:\s*(?:#[0-9a-fA-F]{3,8}|rgb[^;]+|oklch[^;]+|hsl[^;]+)/g)].map((m) => m[0]))];

// --- HTML: readable text content (strip tags) ---
const bodyText = html
  .replace(/<script[\s\S]*?<\/script>/g, ' ')
  .replace(/<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&#x27;/g, "'")
  .replace(/&quot;/g, '"')
  .replace(/\s+/g, ' ')
  .trim();

// --- HTML: meta tags ---
const metas = [...html.matchAll(/<meta[^>]+>/g)].map((m) => m[0]).slice(0, 40);
const links = [...html.matchAll(/<link[^>]+>/g)].map((m) => m[0]);

// --- HTML: __next / flight data hints (RSC payload) ---
const selfHref = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]).filter((h) => !h.startsWith('http') && !h.startsWith('data:'));

let report = '# Haoqi.design — Extracted Tokens & Structure\n\n';
report += `## Fonts (@font-face: ${fontFaces.length})\n\n\`\`\`css\n${fontFaces.join('\n\n')}\n\`\`\`\n\n`;
report += `## Token blocks (:root / @theme / .dark)\n\n\`\`\`css\n${rootBlocks.join('\n\n')}\n\`\`\`\n\n`;
report += `## Color-like var defs (${varDefs.length})\n\n\`\`\`\n${varDefs.join('\n')}\n\`\`\`\n\n`;
report += `## Meta tags\n\n\`\`\`html\n${metas.join('\n')}\n\`\`\`\n\n`;
report += `## Link tags\n\n\`\`\`html\n${links.join('\n')}\n\`\`\`\n\n`;
report += `## Internal hrefs\n\n${[...new Set(selfHref)].join('\n')}\n\n`;
report += `## Body text (stripped)\n\n${bodyText}\n`;

writeFileSync(join(out, 'raw-extract.md'), report);
console.log('font-faces:', fontFaces.length);
console.log('token blocks:', rootBlocks.length);
console.log('var defs:', varDefs.length);
console.log('body text length:', bodyText.length);
console.log('Wrote', join(out, 'raw-extract.md'));
