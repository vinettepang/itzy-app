const r = await fetch('https://kplaceshop.com/products/itzy-twinzy-plush-original-ver-the-3rd-fan-meeting-midzys-cells-pop-up-store-official-md.json', {
  headers: { 'User-Agent': 'Mozilla/5.0' },
});
console.log('status', r.status);
const j = await r.json();
const imgs = j?.product?.images?.map((i) => i.src) ?? [];
console.log(imgs.join('\n'));
