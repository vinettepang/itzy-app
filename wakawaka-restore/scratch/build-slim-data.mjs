/**
 * Transform Plato dumps → slim runtime data for the wakawaka rebuild.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scratch = __dirname;
const outDir = path.resolve(__dirname, '../../apps/h5/src/pages/wakawaka/data');
const fontDir = path.resolve(__dirname, '../../apps/h5/public/wakawaka-static/fonts');
console.log('outDir', outDir);
console.log('exists parent', fs.existsSync(path.dirname(outDir)));

function read(name) {
  return JSON.parse(fs.readFileSync(path.join(scratch, name), 'utf8'));
}

function imgUrl(asset, w = 1600) {
  if (!asset?.url) return null;
  const base = asset.url.split('?')[0];
  return `${base}?w=${w}&fit=max&auto=format&q=85`;
}

const home = read('plato_.json');
const studio = read('plato_studio.json');
const catalogue = read('plato_catalogue.json');
const furniture = read('plato_furniture.json');
const cylinder = read('plato_cylinder-back.json');
const compartment = read('plato_compartment-chair.json');

const settings = home.globals?.SiteSettings ?? {};

const site = {
  title: settings.title ?? 'WAKA-WAKA',
  description: settings.description ?? '',
  phone: settings.globalFooterPhone ?? '',
  location: settings.globalFooterLocation ?? 'Los Angeles, CA',
  footerLeft: settings.globalFooterLeftCopy ?? 'functional objects',
  copyrightLabel: settings.globalFooterCopyrightLabel ?? 'Waka Waka',
  copyrightYears: settings.globalFooterCopyrightYears ?? '©2026',
  links: settings.globalFooterLinks ?? [],
  shareImage: imgUrl(settings.shareImage?.asset, 1200),
};

const featuredChairs = (home.serverData?.featuredChairs ?? []).map((c) => ({
  name: c.name,
  slug: c.slug?.current,
  image1: imgUrl(c.featured_image_1?.asset),
  image2: imgUrl(c.featured_image_2?.asset),
  color1: c.featured_image_1?.asset?.metadata?.palette?.muted?.background ?? '#807e7b',
  color2: c.featured_image_2?.asset?.metadata?.palette?.muted?.background ?? '#8f7054',
  ratio1:
    c.featured_image_1?.asset?.metadata?.dimensions
      ? Math.round(
          (c.featured_image_1.asset.metadata.dimensions.height /
            c.featured_image_1.asset.metadata.dimensions.width) *
            100,
        )
      : 124,
}));

const allChairs = (catalogue.serverData?.allChair ?? []).map((c, i) => ({
  n: String(i + 1).padStart(4, '0'),
  name: c.name,
  slug: c.slug?.current,
  image: imgUrl(c.featured_image_1?.asset ?? c.imagesGallery?.[0]?.asset, 800),
  color: c.featured_image_1?.asset?.metadata?.palette?.muted?.background ?? '#c4c4bc',
}));

const studioPage = {
  image: imgUrl(studio.serverData?.aboutMainImage?.asset, 1600),
  contentRaw: studio.serverData?.aboutMainContentRaw ?? [],
  phoneLabel: studio.serverData?.aboutPhoneLabel ?? 'Phone',
  phone: studio.serverData?.aboutPhoneContent ?? site.phone,
  emailLabel: studio.serverData?.aboutEmailLabel ?? 'Email',
  email: studio.serverData?.aboutEmailContent ?? 'info@wakawaka.world',
  socialLabel: studio.serverData?.aboutSocialLabel ?? 'Social',
  socialLinks: studio.serverData?.aboutSocialLinks ?? [],
  press: (studio.serverData?.aboutPress ?? []).map((p) => ({
    title: p.title ?? p.pressTitle ?? '',
    outlet: p.outlet ?? p.pressOutlet ?? '',
    url: p.url ?? p.pressUrl ?? null,
  })),
};

// Furniture filters: keep category list + chair items slim
const filtersRaw = furniture.serverData?.filters ?? [];
const furnitureFilters = filtersRaw.map((f) => ({
  title: f.title ?? f.name ?? '',
  slug: f.slug?.current ?? f.slug ?? '',
  count: Array.isArray(f.chairs) ? f.chairs.length : f.count ?? null,
}));

// Pull chairs from first filter that looks like chair collection
const chairFilter =
  filtersRaw.find((f) => (f.slug?.current || f.slug) === 'chair-collection') ??
  filtersRaw.find((f) => /chair/i.test(f.title || f.name || '')) ??
  filtersRaw[0];

const furnitureChairs = (chairFilter?.chairs ?? allChairs.map((c) => ({
  name: c.name,
  slug: { current: c.slug },
  featured_image_1: { asset: { url: c.image } },
}))).map((c, i) => ({
  n: String(i + 1).padStart(4, '0'),
  name: c.name,
  slug: c.slug?.current ?? c.slug,
  image: imgUrl(c.featured_image_1?.asset ?? c.imagesGallery?.[0]?.asset, 800),
  color: c.featured_image_1?.asset?.metadata?.palette?.muted?.background ?? '#c4c4bc',
}));

function slimProduct(p) {
  if (!p?.serverData) return null;
  const d = p.serverData;
  return {
    name: d.name,
    slug: d.slug?.current ?? d.slug,
    chairType: d.chairType,
    description: d.description,
    dimensions: d.dimensions,
    infos: d.chairInfos ?? [],
    specSheet: d.specSheet?.asset?.url ?? null,
    gallery: (d.imagesGallery ?? []).map((img) => ({
      url: imgUrl(img.asset, 1600),
      color: img.asset?.metadata?.palette?.muted?.background ?? '#c4c4bc',
      ratio: img.asset?.metadata?.dimensions
        ? Math.round((img.asset.metadata.dimensions.height / img.asset.metadata.dimensions.width) * 100)
        : 125,
    })),
    next: d.next
      ? { name: d.next.name, slug: d.next.slug?.current ?? d.next.slug }
      : null,
  };
}

const products = {
  'cylinder-back': slimProduct(cylinder),
  'compartment-chair': slimProduct(compartment),
};

// Build product index from catalogue for remaining slugs (minimal)
for (const c of allChairs) {
  if (!products[c.slug]) {
    products[c.slug] = {
      name: c.name,
      slug: c.slug,
      chairType: 'Chair',
      description: null,
      dimensions: null,
      infos: [],
      specSheet: null,
      gallery: c.image ? [{ url: c.image, color: c.color, ratio: 125 }] : [],
      next: null,
    };
  }
}

fs.mkdirSync(outDir, { recursive: true });
const files = {
  'site.json': site,
  'featuredChairs.json': featuredChairs,
  'catalogue.json': { title: catalogue.serverData?.pageTitle ?? 'Catalogue\nFW/20', chairs: allChairs },
  'studio.json': studioPage,
  'furniture.json': { filters: furnitureFilters, chairs: furnitureChairs },
  'products.json': products,
};

for (const [name, data] of Object.entries(files)) {
  const fp = path.join(outDir, name);
  fs.writeFileSync(fp, JSON.stringify(data, null, 2));
  console.log(name, fs.statSync(fp).size);
}
