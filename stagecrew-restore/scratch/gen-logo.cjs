const fs = require('fs');
const path = require('path');
const svg = fs.readFileSync(path.join(__dirname, 'logo-full.svg'), 'utf8');
const paths = [...svg.matchAll(/d="([^"]+)"/g)].map((m) => m[1]);
const body = paths
  .map((d) => `      <path className="sc-logo__path" d="${d}" />`)
  .join('\n');

const out = `/** STAGECREW wordmark — paths from prod header SVG (93×12). */
export default function StagecrewLogo({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      width="93"
      height="12"
      viewBox="0 0 93 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
${body}
    </svg>
  );
}
`;

fs.writeFileSync(
  path.join(__dirname, '../../apps/h5/src/pages/stagecrew/StagecrewLogo.tsx'),
  out,
);
console.log('wrote logo with', paths.length, 'paths');
