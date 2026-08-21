/* eslint-disable */
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname);

function u(s) {
  // s already contains real chars if we build via from code below
  return s;
}

function fromCP(cps) {
  return String.fromCodePoint(...cps);
}

/** Build cheer guide TS from structured ASCII-safe data */
function emitGuide(guide) {
  const lines = [];
  lines.push("import type { CheerGuide } from '../types';");
  lines.push("import { L, cheer, echo } from '../types';");
  lines.push('');

  function emitColumn(name, col) {
    lines.push(`const ${name} = [`);
    for (const row of col) {
      const parts = row
        .map((span) => {
          const text = JSON.stringify(span.t);
          if (span.k === 'c') return `cheer(${text})`;
          if (span.k === 'e') return `echo(${text})`;
          return text;
        })
        .join(', ');
      lines.push(`  L(${parts}),`);
    }
    lines.push('];');
    lines.push('');
  }

  emitColumn('LEFT', guide.left);
  emitColumn('RIGHT', guide.right);

  const exportName = guide.exportName;
  lines.push(`export const ${exportName}: CheerGuide = {`);
  lines.push(`  slug: ${JSON.stringify(guide.slug)},`);
  lines.push(`  title: ${JSON.stringify(guide.title)},`);
  lines.push(`  credit: ${JSON.stringify(guide.credit)},`);
  lines.push(`  accent: ${JSON.stringify(guide.accent)},`);
  lines.push('  columns: [LEFT, RIGHT],');
  lines.push('};');
  lines.push('');

  const file = path.join(OUT, guide.file);
  fs.writeFileSync(file, lines.join('\n'), 'utf8');
  const check = fs.readFileSync(file, 'utf8');
  const hangul = (check.match(/[\uAC00-\uD7A3]/g) || []).length;
  const cjk = (check.match(/[\u4e00-\u9fff]/g) || []).length;
  console.log(guide.file, 'hangul=' + hangul, 'cjk=' + cjk);
}

// spans: {k:'l'|'c'|'e', t:string}
const H = (...cps) => String.fromCodePoint(...cps);

// Common CJK / Hangul fragments via code points (ASCII-safe source)
const T = {
  cheerBang: '(' + H(0x6b22, 0x547c) + '!!!)',
  yingyuan: H(0x5e94, 0x63f4, 0x6cd5),
  members:
    '(' +
    H(0x9ec4, 0x793c, 0x5fd7) +
    ' ' +
    H(0x5d14, 0x667a, 0x79c0) +
    ' ' +
    H(0x7533, 0x7559, 0x771f) +
    ' ' +
    H(0x674e, 0x5f69, 0x9886) +
    ' ' +
    H(0x7533, 0x6709, 0x5a1c) +
    ')',
};

module.exports = { emitGuide, H, T, fromCP };
