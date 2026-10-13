import { tfibAsset } from './assets';

const PREFIX = tfibAsset('assets/universal/scripts-compressed/');

const CORE_SCRIPTS = [
  `${PREFIX}extract-css-runtime-021ab5545f692ef4-min.en-US.js`,
  `${PREFIX}common-vendors-stable-1988b40b24a74586-min.en-US.js`,
  `${PREFIX}common-vendors-169124972d82cc80-min.en-US.js`,
  `${PREFIX}common-baeaf74ebe228782-min.en-US.js`,
  `${PREFIX}performance-725514c9ba131df8-min.en-US.js`,
];

function loadScriptOnce(src: string): Promise<void> {
  const key = `tfib-js:${src}`;
  const existing = document.querySelector(`script[data-tfib="${key}"]`);
  if (existing) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const el = document.createElement('script');
    el.src = src;
    el.crossOrigin = 'anonymous';
    el.defer = true;
    el.dataset.tfib = key;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(el);
  });
}

/** Squarespace webpack + common（区块滚动动画等依赖此运行时）。需在 site-inner 注入之后调用。 */
export async function tfibLoadSquarespaceCore(): Promise<void> {
  if (!(window as Window & { SQUARESPACE_ROLLUPS?: unknown }).SQUARESPACE_ROLLUPS) {
    (window as Window & { SQUARESPACE_ROLLUPS: Record<string, unknown> }).SQUARESPACE_ROLLUPS = {};
  }
  for (const src of CORE_SCRIPTS) {
    await loadScriptOnce(src);
  }
}
