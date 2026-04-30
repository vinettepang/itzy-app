const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const tsconfig = path.join(__dirname, 'tsconfig.json');
const roots = [path.join(__dirname, '..', '..'), __dirname];

function findTsc() {
  for (const root of roots) {
    const candidate = path.join(root, 'node_modules', 'typescript', 'lib', 'tsc.js');
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

const tsc = findTsc();
if (!tsc) {
  console.error(
    '[@itzy-app/services] Cannot find typescript/lib/tsc.js under repo root or this package. Run `pnpm install` at the monorepo root.',
  );
  process.exit(1);
}

const r = spawnSync(process.execPath, [tsc, '-p', tsconfig], { stdio: 'inherit' });
process.exit(r.status === null ? 1 : r.status);
