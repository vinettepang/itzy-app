/** 镜像脚本拉取的静态资源，供 React 页引用（非整页 HTML 跳转）。 */
const root = `${import.meta.env.BASE_URL || '/'}thefutureinblack/`.replace(/\/{2,}/g, '/');

export function tfibAsset(path: string): string {
  return `${root}${path.replace(/^\//, '')}`;
}

export const TFIB_FONT_MILLION = tfibAsset(
  'assets/content/v2/namespaces/fonts/libraries/69f3f6e86bfa6f4418b84f0e/assets/6cc4fe63-6e66-4fc7-9b32-c373424983fe/font.woff2',
);

export const TFIB_IMAGES = {
  logo: tfibAsset(
    'assets/static/69f3f6e86bfa6f4418b84f0e/t/6a2711f8b6510f0c41ebb9d3/1780945400794/The_Future_in_Black_69+%282%29+%281%29--459b3f59.png',
  ),
  heroFigure: tfibAsset(
    'assets/content/v1/69f3f6e86bfa6f4418b84f0e/8a49b5dc-4f48-4fc0-b8e9-1fa3d7c742e6/The_Future_in_Black_33+Transparent--459b3f59.png',
  ),
  founder: tfibAsset(
    'assets/content/v1/69f3f6e86bfa6f4418b84f0e/e4fb9d49-9e10-44c4-933a-b8ad9e26c7c6/The_Future_in_Black_29--720d2f2d.jpg',
  ),
  arrow: tfibAsset(
    'assets/static/69f3f6e86bfa6f4418b84f0e/t/6a0e44ebd4117b457e1155ce/1779320043340/long-arrow-alt-right-solid.png',
  ),
  frame: tfibAsset(
    'assets/static/69f3f6e86bfa6f4418b84f0e/t/6a0de997371ad3193359160f/1779296663241/Frame+1948755038.png',
  ),
} as const;
