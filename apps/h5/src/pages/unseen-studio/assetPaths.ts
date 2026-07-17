export const UNSEEN_PUBLIC = '/unseen-studio-static/public/';
export const UNSEEN_ASSETS = '/unseen-studio-static/resources/assets/';

export const UNSEEN_FONT_CSS = `
@font-face {
  font-family: 'Neue Montreal';
  font-style: normal;
  font-weight: 400;
  src:
    url('${UNSEEN_ASSETS}fonts/NeueMontreal-Regular.woff2') format('woff2'),
    url('${UNSEEN_ASSETS}fonts/NeueMontreal-Regular.woff') format('woff');
}
@font-face {
  font-family: 'Saol Display';
  font-style: normal;
  font-weight: 400;
  src:
    url('${UNSEEN_ASSETS}fonts/SaolDisplay-Light.woff2') format('woff2'),
    url('${UNSEEN_ASSETS}fonts/SaolDisplay-Light.woff') format('woff');
}
@font-face {
  font-family: 'Saol Display';
  font-style: italic;
  font-weight: 400;
  src:
    url('${UNSEEN_ASSETS}fonts/SaolDisplay-LightItalic.woff2') format('woff2'),
    url('${UNSEEN_ASSETS}fonts/SaolDisplay-LightItalic.woff') format('woff');
}
`;

export const NAV = [
  { to: '/unseen-studio', label: 'Index', n: '01' },
  { to: '/unseen-studio/projects', label: 'Projects', n: '02' },
  { to: '/unseen-studio/contact', label: 'Contact', n: '03' },
  { to: '/unseen-studio/world', label: 'World', n: '04' },
] as const;

export const TAGLINE =
  'A brand, digital and motion studio creating refreshingly unexpected ideas and striking visuals that help bold brands cut through the noise.';
