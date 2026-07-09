/** 生产站 chunk 1247 主题（VAA 主页循环 0–3） */
export type VirgilThemeColors = {
  background: string;
  text: string;
  accent: string;
  border: string;
  graphicOpacity: number;
};

export const VIRGIL_THEME_COUNT = 4;

export const VIRGIL_THEMES: VirgilThemeColors[] = [
  {
    background: '#1C4A96',
    text: '#FFFFFF',
    accent: '#b9e7fe',
    border: '#FFFFFF',
    graphicOpacity: 0.2,
  },
  {
    background: '#B9E7FE',
    text: '#1C4A96',
    accent: '#0d4a63',
    border: '#1C4A96',
    graphicOpacity: 1,
  },
  {
    background: '#FFFFFF',
    text: '#1C4A96',
    accent: '#0d4a63',
    border: '#1C4A96',
    graphicOpacity: 1,
  },
  {
    background: '#FFFFFF',
    text: '#1C4A96',
    accent: '#0d4a63',
    border: '#1C4A96',
    graphicOpacity: 1,
  },
];

export function getVirgilTheme(index: number): VirgilThemeColors {
  return VIRGIL_THEMES[index % VIRGIL_THEME_COUNT];
}
