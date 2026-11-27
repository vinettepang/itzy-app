const ASSET_BASE = '/felixpeault/_app/immutable/assets';

export const FELIX_MIRROR_STYLES = {
  global: `${ASSET_BASE}/0.BbxeAAYK.css`,
  home: `${ASSET_BASE}/3.Bj10hmur.css`,
  info: `${ASSET_BASE}/InfoPanel.ByiXl0az.css`,
  sanityImage: `${ASSET_BASE}/SanityImage.P0n-wPBz.css`,
  series: `${ASSET_BASE}/8.Cty4xNgE.css`,
} as const;

const LINK_ID = 'felix-mirror-styles';

export function getFelixMirrorStyleHrefs(extra: string[] = []) {
  return [
    FELIX_MIRROR_STYLES.global,
    FELIX_MIRROR_STYLES.sanityImage,
    FELIX_MIRROR_STYLES.info,
    ...extra,
  ];
}

export function ensureFelixMirrorStyleLinks(hrefs: string[]) {
  let root = document.getElementById(LINK_ID);
  if (!root) {
    root = document.createElement('div');
    root.id = LINK_ID;
    root.hidden = true;
    document.head.appendChild(root);
  }

  const wanted = new Set(hrefs);
  root.querySelectorAll<HTMLLinkElement>('link[data-felix-mirror]').forEach((link) => {
    const path = link.getAttribute('href');
    if (path && !wanted.has(path)) link.remove();
  });

  for (const href of hrefs) {
    const exists = root.querySelector<HTMLLinkElement>(
      `link[data-felix-mirror][href="${href}"]`,
    );
    if (exists) continue;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.dataset.felixMirror = '1';
    root.appendChild(link);
  }
}
