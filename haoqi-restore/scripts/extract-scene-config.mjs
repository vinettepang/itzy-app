/**
 * Pull readable windows around scene-config tokens in the custom scene chunk,
 * and pretty-save the custom shaders. Output to analysis/scene/ (not to chat).
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const chunkDir = join(__dirname, '..', 'assets', 'chunks');
const shaderDir = join(__dirname, '..', 'analysis', 'shaders');
const out = join(__dirname, '..', 'analysis', 'scene');
mkdirSync(out, { recursive: true });

const SCENE_CHUNK = '7758f29a8aeb1c60.js';
const code = readFileSync(join(chunkDir, SCENE_CHUNK), 'utf8');

// Windows around key tokens
const tokens = [
  'hello.gltf', 'cnt.gltf', 'cursor.glb',
  'MeshPhysicalMaterial', 'MeshStandardMaterial', 'ShaderMaterial',
  'PerspectiveCamera', 'OrthographicCamera', 'fov:',
  'uIorR', 'uChromaticAberration', 'uSaturation', 'uRefract',
  'iResolution', 'uScrollDuration', 'particleCount', 'spawnWidth',
  'DirectionalLight', 'AmbientLight', 'toneMapping', 'ACESFilmic',
  'clearColor', 'setClearColor', 'background', 'roughness:', 'metalness:',
  'transmission:', 'thickness:', 'ior:', 'clearcoat:',
];

let report = `# Scene config windows from ${SCENE_CHUNK}\n\n`;
const seen = new Set();
for (const tok of tokens) {
  let from = 0;
  let count = 0;
  while (count < 4) {
    const i = code.indexOf(tok, from);
    if (i === -1) break;
    const start = Math.max(0, i - 220);
    const end = Math.min(code.length, i + 420);
    const window = code.slice(start, end);
    const key = window.slice(0, 60);
    if (!seen.has(key)) {
      seen.add(key);
      report += `## \`${tok}\` @${i}\n\n\`\`\`js\n...${window}...\n\`\`\`\n\n`;
      count++;
    }
    from = i + tok.length;
  }
}
writeFileSync(join(out, 'scene-windows.md'), report);

// Pretty-print custom shaders (add newlines after ; and { })
function pretty(glsl) {
  return glsl
    .replace(/;/g, ';\n')
    .replace(/\{/g, '{\n')
    .replace(/\}/g, '}\n')
    .replace(/\n\s*\n/g, '\n');
}
const customShaders = readdirSync(shaderDir).filter((f) => /^(7758f29a8aeb1c60|e553ef8ae208a000)__/.test(f) && f.endsWith('.glsl'));
mkdirSync(join(out, 'shaders-pretty'), { recursive: true });
for (const f of customShaders) {
  const src = readFileSync(join(shaderDir, f), 'utf8');
  writeFileSync(join(out, 'shaders-pretty', f), pretty(src));
}
console.log('scene-windows.md written; pretty shaders:', customShaders.length);
console.log('custom shaders:', customShaders.join(', '));
