/**
 * Transform Directus CMS dumps into lean JSON for the h5 Stagecrew rebuild.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname);
const OUT = path.join(__dirname, '../../apps/h5/src/pages/stagecrew/data');

const CMS_ASSET = (id, query = 'width=1600&format=webp&quality=75') =>
  id ? `https://cms.stagecrew.studio/assets/${id}?${query}` : null;

const BUNNY = (id, query = 'width=1600&format=webp&quality=75') =>
  id ? `https://stagecrew-media.b-cdn.net/${id}?${query}` : null;

function fileMedia(file) {
  if (!file) return null;
  const id = file.id;
  const isVideo = (file.type || '').startsWith('video') || !!file.vimeo_id;
  return {
    id,
    type: isVideo ? 'video' : 'image',
    mime: file.type || null,
    width: file.width || file.vimeo_width || null,
    height: file.height || file.vimeo_height || null,
    src: isVideo
      ? file.vimeo_url || CMS_ASSET(id)
      : BUNNY(id) || CMS_ASSET(id),
    poster: file.vimeo_thumb || (isVideo ? null : BUNNY(id, 'width=800&format=webp&quality=60')),
    filename: file.filename_disk || null,
  };
}

const projectsRaw = JSON.parse(fs.readFileSync(path.join(ROOT, 'cms-projects-full.json'), 'utf8')).data;
const pageWork = JSON.parse(fs.readFileSync(path.join(ROOT, 'cms-page-work.json'), 'utf8')).data;
const pageInfo = JSON.parse(fs.readFileSync(path.join(ROOT, 'cms-page-info.json'), 'utf8')).data;
const pageBackstage = JSON.parse(fs.readFileSync(path.join(ROOT, 'cms-page-backstage.json'), 'utf8')).data;
const header = JSON.parse(fs.readFileSync(path.join(ROOT, 'cms-global-header.json'), 'utf8')).data;
const footer = JSON.parse(fs.readFileSync(path.join(ROOT, 'cms-global-footer.json'), 'utf8')).data;

const projects = projectsRaw
  .slice()
  .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
  .map((p) => ({
    id: p.id,
    title: p.title,
    subtitle: p.subtitle || null,
    slug: p.slug,
    sort: p.sort,
    isComingSoon: !!p.is_coming_soon,
    text: p.text || '',
    areas: (p.areas || [])
      .map((a) => a.areas_id?.title)
      .filter(Boolean),
    cover: fileMedia(p.cover),
    gallery: (p.gallery || [])
      .slice()
      .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
      .map((g) => fileMedia(g.directus_files_id))
      .filter(Boolean),
    crew: (p.crew || []).map((c) => ({
      role: c.role || c.title || null,
      name: c.name || c.person || null,
      raw: c,
    })),
  }));

const site = {
  name: 'STAGECREW',
  header: {
    externalLinks: header.external_links || [],
  },
  footer: {
    text: footer.Text || footer.text || '',
    disclaimer: footer.disclaimer || '',
    contactInfo: footer.contact_info || '',
    bottomLabels: (footer.bottom_labels || []).map((x) => x.label),
  },
  work: {
    introHtml: pageWork.text || '',
  },
  info: {
    title: pageInfo.title,
    text: pageInfo.text,
    title2: pageInfo.title2,
    text2: pageInfo.text2,
    title3: pageInfo.title3,
    text3: pageInfo.text3,
    text4: pageInfo.text4,
    infoLists: pageInfo.info_lists || [],
    media: fileMedia(pageInfo.media),
    media3: fileMedia(pageInfo.media3),
    media4: fileMedia(pageInfo.media4),
  },
  backstage: {
    title: pageBackstage.title,
    text: pageBackstage.text,
  },
  projects,
};

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'site.json'), JSON.stringify(site, null, 2));
fs.writeFileSync(
  path.join(OUT, 'projects.json'),
  JSON.stringify(Object.fromEntries(projects.map((p) => [p.slug, p])), null, 2),
);
console.log('wrote', projects.length, 'projects →', OUT);
