import fs from 'fs';

const p = new URL('../../apps/h5/src/pages/wakawaka/wakawaka.prod.css', import.meta.url);
let css = fs.readFileSync(p, 'utf8');

const map = {
  '/assets/8ff95cff433faf482de7.woff2': '/wakawaka-static/fonts/waka-sans-700.woff2',
  '/assets/a26dd78efba8d50bb671.woff2': '/wakawaka-static/fonts/waka-sans-500.woff2',
  '/assets/1193a2b2c357644f7fb8.woff2': '/wakawaka-static/fonts/waka-sans-400.woff2',
  '/assets/78c2cb8d6c54087bb4be.woff2': '/wakawaka-static/fonts/domaine-text-300.woff2',
};

for (const [from, to] of Object.entries(map)) {
  css = css.split(from).join(to);
}

css = css.replace(/,url\(\/assets\/[^)]+\.woff\) format\("woff"\)/g, '');
fs.writeFileSync(p, css);
console.log('ok', css.length);
