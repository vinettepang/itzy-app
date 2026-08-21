const fs = require('fs');
const path = require('path');
const decoded = JSON.parse(fs.readFileSync(path.join(__dirname, 'payload-backstage.decoded.json'), 'utf8'));

function findBackstage(obj, depth = 0) {
  if (!obj || depth > 8) return null;
  if (Array.isArray(obj)) {
    if (obj[0]?.__typename === 'backstage') return obj;
    for (const x of obj) {
      const f = findBackstage(x, depth + 1);
      if (f) return f;
    }
    return null;
  }
  if (typeof obj === 'object') {
    if (Array.isArray(obj.backstage) && obj.backstage[0]?.__typename === 'backstage') return obj.backstage;
    for (const v of Object.values(obj)) {
      const f = findBackstage(v, depth + 1);
      if (f) return f;
    }
  }
  return null;
}

const items = findBackstage(decoded) || [];
function media(file) {
  if (!file) return null;
  const isVideo = (file.type || '').startsWith('video') || !!file.vimeo_id;
  const key = file.filename_disk || `${file.id}.jpg`;
  return {
    id: file.id,
    type: isVideo ? 'video' : 'image',
    mime: file.type || null,
    width: file.width || file.vimeo_width || null,
    height: file.height || file.vimeo_height || null,
    src: isVideo
      ? file.vimeo_url
      : `https://stagecrew-media.b-cdn.net/${key}?width=1600&format=webp&quality=75`,
    poster: file.vimeo_thumb || null,
    filename: file.filename_disk || null,
  };
}

const out = items
  .slice()
  .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
  .map((it) => ({
    column: String(it.column || '1'),
    info: it.info || '',
    title: it.title || '',
    sort: it.sort,
    media: media(it.media),
  }));

const sitePath = path.join(__dirname, '../../apps/h5/src/pages/stagecrew/data/site.json');
const site = JSON.parse(fs.readFileSync(sitePath, 'utf8'));
site.backstage = {
  ...site.backstage,
  items: out,
};

// Fix bunny image URLs missing extension across site tree
function fixUrls(node) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) return node.forEach(fixUrls);
  if (typeof node.src === 'string' && node.src.includes('stagecrew-media.b-cdn.net/')) {
    try {
      const u = new URL(node.src);
      const base = u.pathname.split('/').pop() || '';
      if (!base.includes('.')) {
        const disk = node.filename && String(node.filename).includes('.') ? node.filename : `${base}.jpg`;
        u.pathname = `/${disk}`;
        node.src = u.toString();
      }
    } catch {}
  }
  if (typeof node.poster === 'string' && node.poster.includes('stagecrew-media.b-cdn.net/')) {
    try {
      const u = new URL(node.poster);
      const base = u.pathname.split('/').pop() || '';
      if (!base.includes('.')) {
        const disk = node.filename && String(node.filename).includes('.') ? node.filename : `${base}.jpg`;
        u.pathname = `/${disk}`;
        node.poster = u.toString();
      }
    } catch {}
  }
  Object.values(node).forEach(fixUrls);
}
fixUrls(site);

fs.writeFileSync(sitePath, JSON.stringify(site, null, 2));
const projectsPath = path.join(__dirname, '../../apps/h5/src/pages/stagecrew/data/projects.json');
const projects = Object.fromEntries(site.projects.map((p) => [p.slug, p]));
fs.writeFileSync(projectsPath, JSON.stringify(projects, null, 2));
console.log('backstage items', out.length, 'projects', site.projects.length);
