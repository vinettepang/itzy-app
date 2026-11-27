import { nothAsset } from './paths';

const HOME_CSS = [
  'b7f99879ff95-nothin-preprod.webflow.shared.764d45d19.min.css',
  '5c0edbf2b8e7-nothin-preprod.webflow.6a0c501c42b9751b78a9d1a3.e2865ee71.opt.min.css',
];

const WORKS_CSS = [
  'b7f99879ff95-nothin-preprod.webflow.shared.764d45d19.min.css',
  '04a606e5f22c-nothin-preprod.webflow.6a293b4208386576cc9ac3c7.2364a93f0.opt.min.css',
];

export function ensureNothStyleLinks(page: 'home' | 'works') {
  const files = page === 'works' ? WORKS_CSS : HOME_CSS;
  const id = 'noth-webflow-styles';
  let root = document.getElementById(id);
  if (!root) {
    root = document.createElement('div');
    root.id = id;
    document.head.appendChild(root);
  }
  root.replaceChildren(
    ...files.map((file) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = nothAsset(file);
      return link;
    }),
  );
}
