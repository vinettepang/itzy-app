/**
 * Collect production asset URLs from Playwright network log JSON
 * or from a pasted list. Also builds a download manifest for home scene.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const scratch = path.join(root, 'scratch');

const HOME_ASSETS = [
  // fonts
  'fonts/NeueMontreal-Regular.woff2',
  'fonts/NeueMontreal-Regular.woff',
  'fonts/SaolDisplay-Light.woff2',
  'fonts/SaolDisplay-Light.woff',
  'fonts/SaolDisplay-LightItalic.woff2',
  'fonts/SaolDisplay-LightItalic.woff',
  // decoders
  'draco/draco_wasm_wrapper.js',
  'draco/draco_decoder.wasm',
  'draco/draco_decoder.js',
  'basis/basis_transcoder.js',
  'basis/basis_transcoder.wasm',
  // audio
  'audio/audio.webm',
  // home models
  'models/home/room-1.glb',
  'models/home/room-2.glb',
  'models/home/chair.glb',
  'models/home/pillows.glb',
  'models/home/rocks.glb',
  'models/home/table-3.glb',
  'models/home/land-group.glb',
  'models/home/grass-simple.glb',
  'models/home/objectsData.glb',
  // project-menu models
  'models/project-menu/butterfly.glb',
  'models/project-menu/arch-dc.glb',
  'models/project-menu/floor-dc.glb',
  // home textures
  'images/home/room-1.ktx2',
  'images/home/room-2.ktx2',
  'images/home/chair.ktx2',
  'images/home/pillows.ktx2',
  'images/home/rocks.ktx2',
  'images/home/table.ktx2',
  'images/home/pearl-matcap.ktx2',
  'images/home/particles.ktx2',
  'images/home/skymap-tile.ktx2',
  'images/home/ao.ktx2',
  'images/project-menu/arch.ktx2',
];

const BASE = 'https://unseen.co/wp-content/themes/unseen/resources/assets/';
const PUBLIC = 'https://unseen.co/wp-content/themes/unseen/public/';

const publicFiles = [
  'images/svgsprite.svg',
  'favicon/apple-touch-icon.png',
  'favicon/favicon-32x32.png',
  'favicon/favicon-16x16.png',
];

const lines = [
  '# unseen.co download manifest (SOURCE · network + HTML)',
  '# Format: url<TAB>localRelPath',
  '',
  ...HOME_ASSETS.map((p) => `${BASE}${p}\tresources/assets/${p}`),
  ...publicFiles.map((p) => `${PUBLIC}${p}\tpublic/${p}`),
  `${PUBLIC}css/style.css?id=63f2ece398b534f2523b0748e42ffee1\tpublic/css/style.css`,
  `${PUBLIC}scripts/manifest.js?id=9660198a1386b5e4e515b7fa518fa84d\tpublic/scripts/manifest.js`,
  `${PUBLIC}scripts/vendor.js?id=4d3ac43b9e360f391febd63f910ddf0c\tpublic/scripts/vendor.js`,
  `${PUBLIC}scripts/theme.js?id=ddeecb32509137704fa301e3ef34c990\tpublic/scripts/theme.js`,
];

fs.writeFileSync(path.join(scratch, 'download-manifest.txt'), lines.join('\n'));
console.log(`Wrote ${HOME_ASSETS.length + publicFiles.length + 4} entries`);
