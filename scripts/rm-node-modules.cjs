const fs = require('fs');
const os = require('os');
const path = require('path');

const root = path.resolve(__dirname, '..');
const rootNodeModules = path.join(root, 'node_modules');
const skipDirNames = new Set(['.git', 'dist', '.next', '.taro']);

function walk(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const full = path.resolve(dir, e.name);
    if (e.name === 'node_modules') {
      // 根目录 node_modules 最后删，避免 pnpm/IDE 仍占用时整棵删不掉（Windows 常见）
      if (full === rootNodeModules) continue;
      fs.rmSync(full, { recursive: true, force: true });
      console.log('removed:', path.relative(root, full) || e.name);
      continue;
    }
    if (skipDirNames.has(e.name)) continue;
    walk(full);
  }
}

function removeRootNodeModules() {
  if (!fs.existsSync(rootNodeModules)) {
    console.log('(no root node_modules)');
    return;
  }
  const prev = process.cwd();
  try {
    process.chdir(os.tmpdir());
  } catch {
    // ignore
  }
  try {
    fs.rmSync(rootNodeModules, { recursive: true, force: true });
    console.log('removed: node_modules');
  } catch (err) {
    console.error('Failed to remove root node_modules:', err && err.message ? err.message : err);
    console.error(
      'Hint: 先关掉本仓库的 dev 进程与占用文件的 IDE，再在仓库根目录执行: node scripts/rm-node-modules.cjs',
    );
    process.exitCode = 1;
  } finally {
    try {
      process.chdir(prev);
    } catch {
      // ignore
    }
  }
}

walk(root);
removeRootNodeModules();
if (!process.exitCode) {
  console.log('clean:modules done.');
}
