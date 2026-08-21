const fs = require('fs');
const html = fs.readFileSync(process.env.TEMP + '/waka-home.html', 'utf8');

// Find body structure pieces
for (const k of ['class="site"', 'label-global', 'logo-global', 'main-background', 'id="homepage"', 'site-header', 'global-cursor']) {
  const re = new RegExp(k, 'g');
  let m;
  let n = 0;
  while ((m = re.exec(html)) && n < 3) {
    console.log('\n==', k, m.index, '==');
    console.log(html.slice(m.index, m.index + 250));
    n++;
  }
}

// Extract site opening markup
const siteIdx = html.indexOf('class=site') >= 0 ? html.indexOf('class=site') : html.indexOf('class="site"');
console.log('\nSITE OPEN', html.slice(siteIdx, siteIdx + 800));
