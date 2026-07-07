const titles = ['LYA', 'TUK', 'CHUNG-EE', 'CABBIT', 'KKengEE', 'Li-Li', 'RyuJJi', 'RyeoWoo', 'NAong', 'TWINZY'];

for (const t of titles) {
  const r = await fetch(`https://itzy.fandom.com/wiki/${encodeURIComponent(t)}`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    signal: AbortSignal.timeout(20000),
  });
  const h = await r.text();
  const imgs = [...h.matchAll(/https:\/\/static\.wikia\.nocookie\.net\/itzy\/images\/[^"'\s)]+/g)].map((m) => m[0]);
  const unique = [...new Set(imgs)].filter((u) => !u.includes('Site-logo') && !u.includes('poweredby'));
  console.log('\n===', t, r.status, '===');
  console.log(unique.slice(0, 5).join('\n'));
}
