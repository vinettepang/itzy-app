const urls = [
  'https://en.thejypshop.com/product/twinzy-plush-original-ver-born-to-be/2845/',
  'https://xduniverse.com.my/products/itzy-twinzy-plush-original-ver.json',
  'https://www.kpopusaonline.com/wp-json/wc/store/products?search=twinzy+plush',
];

for (const url of urls) {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(20000) });
    const text = await r.text();
    const imgs = [...text.matchAll(/https?:\/\/[^"'\s)]+\.(?:jpg|jpeg|png|webp)(?:\?[^"'\s)]*)?/gi)].map((m) => m[0]);
    const filtered = [...new Set(imgs)].filter((u) => /twinzy|wdzy|plush|itzy/i.test(u)).slice(0, 10);
    console.log('\n===', url, r.status, '===');
    console.log(filtered.join('\n') || '(none)');
  } catch (e) {
    console.log('\n===', url, 'ERR', e.message);
  }
}
