import fs from 'node:fs';

const html = fs.readFileSync(new URL('../scratch/index.html', import.meta.url), 'utf8');
const blocks = [...html.matchAll(/<div class="card card-project\s+--pos-(\d)"[\s\S]*?<\/div>\s*<\/a>\s*<\/div>/g)];
const items = blocks.map((b) => {
  const chunk = b[0];
  const pos = +b[1];
  const href = chunk.match(/href="([^"]+)"/)?.[1] ?? '';
  const speedY = parseFloat(chunk.match(/--speed-y:([^;]+)/)?.[1] ?? '0');
  const speedX = parseFloat(chunk.match(/--speed-x:([^;]+)/)?.[1] ?? '0');
  const speed = parseFloat(chunk.match(/header[\s\S]*?--speed:([^;]+)/)?.[1] ?? '0');
  const poster = chunk.match(/poster="([^"]+)"/)?.[1] ?? '';
  const video = chunk.match(/\ssrc="(https:\/\/player\.vimeo[^"]+)"/)?.[1] ?? '';
  const logoAlt = chunk.match(/alt="([^"]+)"[^>]*width="916"/)?.[1] ?? '';
  const client = chunk.match(/para ([^<]+)</)?.[1]?.trim() ?? '';
  const aspect = parseFloat(chunk.match(/--aspect:\s*([0-9.]+)/)?.[1] ?? '0.56');
  const slug = href.replace(/^\/projects\/|\/$/g, '');
  return { pos, href, slug, speedY, speedX, speed, poster, video, logoAlt, client, aspect };
});
console.log(JSON.stringify(items, null, 2));
