/**
 * Scan downloaded JS chunks for GLSL shader source strings and Three.js scene hints.
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const chunkDir = join(__dirname, '..', 'assets', 'chunks');
const out = join(__dirname, '..', 'analysis', 'shaders');
mkdirSync(out, { recursive: true });

const files = readdirSync(chunkDir).filter((f) => f.endsWith('.js'));

// GLSL keyword markers to decide if a string is a shader
const GLSL_MARKERS = /void main\(\)|gl_FragColor|gl_Position|vViewPosition|vUv|texture2D|textureCube|precision (highp|mediump|lowp)/;

function unescapeJs(s) {
  return s
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\r/g, '')
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, '\\')
    .replace(/\\`/g, '`');
}

// Extract string/template literals
function extractLiterals(code) {
  const lits = [];
  // template literals ` ... `
  const tpl = code.match(/`(?:[^`\\]|\\.)*`/g) || [];
  // double-quoted
  const dq = code.match(/"(?:[^"\\]|\\.){40,}"/g) || [];
  // single-quoted
  const sq = code.match(/'(?:[^'\\]|\\.){40,}'/g) || [];
  return [...tpl, ...dq, ...sq];
}

const found = [];
for (const f of files) {
  const code = readFileSync(join(chunkDir, f), 'utf8');
  const lits = extractLiterals(code);
  let idx = 0;
  for (const lit of lits) {
    const inner = unescapeJs(lit.slice(1, -1));
    if (GLSL_MARKERS.test(inner) && inner.length > 60) {
      idx++;
      const name = `${f.replace('.js', '')}__${idx}.glsl`;
      writeFileSync(join(out, name), inner);
      found.push({ file: f, name, len: inner.length, head: inner.slice(0, 80).replace(/\n/g, ' ') });
    }
  }
}

// Also scan for scene-config hints (uniform names, model paths, color hexes near 'hello')
const hints = [];
for (const f of files) {
  const code = readFileSync(join(chunkDir, f), 'utf8');
  for (const kw of ['hello.gltf', 'cnt.gltf', 'cursor.glb', 'matcap', 'envMap', 'roughness', 'metalness', 'transmission', 'MeshPhysicalMaterial', 'MeshStandardMaterial', 'RoomEnvironment', 'PMREMGenerator', 'fov', 'DirectionalLight', 'AmbientLight', 'toneMapping', 'ACESFilmic', 'clearcoat', 'ior', 'thickness']) {
    if (code.includes(kw)) hints.push({ file: f, kw });
  }
}

writeFileSync(join(out, '_index.json'), JSON.stringify({ found, hints }, null, 2));
console.log('Shader strings found:', found.length);
found.forEach((x) => console.log(' ', x.name, x.len, '|', x.head));
console.log('\nScene hints:');
const byKw = {};
hints.forEach((h) => { (byKw[h.kw] ??= []).push(h.file.replace('.js', '')); });
Object.entries(byKw).forEach(([k, v]) => console.log(' ', k, '->', [...new Set(v)].join(',')));
