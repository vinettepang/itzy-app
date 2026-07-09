import fs from 'fs';

const s = fs.readFileSync(new URL('./index.js', import.meta.url), 'utf8');
const outDir = new URL('../analysis/', import.meta.url);

const patterns = [
  'createBubbleMaterial',
  'createFillPlanes',
  'createBackground',
  'addText',
  'switchToScene1',
  'switchToScene2',
  'onPointerDown',
  'onPointerUp',
  'metal-dc',
  'unseen-dc',
  'ior:',
  'transmission:',
  'thickness:',
  'roughness:',
  'envFbo',
  'skyFbo',
  'matcap',
  'CustomEase',
  'sceneSwitchTl',
];

for (const p of patterns) {
  let idx = 0;
  let found = 0;
  while (found < 3) {
    const i = s.indexOf(p, idx);
    if (i < 0) break;
    const chunk = s.slice(Math.max(0, i - 120), i + 600);
    const file = `${outDir.pathname.replace(/^\/([A-Z]:)/, '$1')}bundle-snippets-${p.replace(/[^a-z0-9]+/gi, '-')}-${found}.txt`;
    fs.writeFileSync(file, chunk, 'utf8');
    console.log('wrote', file);
    idx = i + p.length;
    found++;
  }
}
