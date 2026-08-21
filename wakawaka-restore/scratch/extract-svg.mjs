import fs from 'fs';

const html = fs.readFileSync(new URL('./home.html', import.meta.url), 'utf8');
const m = html.match(/<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 44 61"[\s\S]*?<\/svg>/);
if (!m) throw new Error('svg not found');

const out = `import type { SVGProps } from 'react';

/** SOURCE · wakawaka.world wordmark glyph */
export default function WakaMark(props: SVGProps<SVGSVGElement>) {
  return (
    ${m[0].replace('<svg', '<svg {...props}')}
  );
}
`;

fs.writeFileSync(
  new URL('../../apps/h5/src/pages/wakawaka/WakaMark.tsx', import.meta.url),
  out,
);
console.log('ok', m[0].length);
