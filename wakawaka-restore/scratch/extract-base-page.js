const fs = require('fs');
const c = fs.readFileSync('wakawaka-restore/scratch/219.prod.js', 'utf8');
// dump whole file prettified-ish
const keys = ['setupDOM','initTL','onDOMInit','showComponent','onShown','onHidden','appendChild','TL.show','play'];
for (const k of keys) {
  let i = 0, n = 0;
  while ((i = c.indexOf(k, i)) >= 0 && n < 4) {
    console.log('\n---', k, i, '---');
    console.log(c.slice(Math.max(0,i-80), i+350));
    i += k.length; n++;
  }
}

// Also check html for label-global logo-global in home html
const html = fs.readFileSync(process.env.TEMP + '/waka-home.html', 'utf8');
for (const k of ['label-global','logo-global','main-background','is-intro','LARGER']) {
  const i = html.indexOf(k);
  console.log('\nHTML', k, i);
  if (i>=0) console.log(html.slice(Math.max(0,i-120), i+300));
}
