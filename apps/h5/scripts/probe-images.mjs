const tests = [
  'https://static.wikia.nocookie.net/itzy/images/d/d4/TWINZY_Group.jpeg/revision/latest/scale-to-width-down/800?cb=20240330155259',
  'https://static.wikia.nocookie.net/itzy/images/8/80/HET_Final_Render.jpg/revision/latest/scale-to-width-down/800?cb=20200923065105',
  'https://jypj-store.com/products/iz00-t01-0001.json',
  'https://byulverse.eu/products/itzy-itzy-x-twinzy-official-twinzy-monitor-figure-947.json',
];

for (const url of tests) {
  if (url.endsWith('.json')) {
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const j = await r.json();
    console.log('\nJSON', url, r.status);
    console.log((j?.product?.images ?? []).map((i) => i.src).join('\n'));
    continue;
  }
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  console.log(r.status, url);
}
