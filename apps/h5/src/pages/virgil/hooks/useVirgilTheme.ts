import { useCallback, useEffect, useState } from 'react';
import { getVirgilTheme, VIRGIL_THEME_COUNT } from '../virgilThemes';

const TRANSITION = '0.5s ease';

/** 生产站 ThemeCycle：滚到底 advanceTheme + I 反色 + Space 手动切换 */
export function useVirgilTheme() {
  const [themeIndex, setThemeIndex] = useState(0);
  const [inverted, setInverted] = useState(false);
  const theme = getVirgilTheme(themeIndex);

  useEffect(() => {
    document.documentElement.classList.toggle('virgil-inverted', inverted);
    return () => document.documentElement.classList.remove('virgil-inverted');
  }, [inverted]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--virgil-bg', theme.background);
    root.style.setProperty('--virgil-text', theme.text);
    root.style.setProperty('--virgil-accent', theme.accent);
    root.style.setProperty('--virgil-border', theme.border);
    root.style.setProperty('--virgil-graphic-opacity', String(theme.graphicOpacity));
    root.style.transition = `background-color ${TRANSITION}, color ${TRANSITION}`;
    document.body.style.backgroundColor = theme.background;
    document.body.style.color = theme.text;
    document.body.style.transition = `background-color ${TRANSITION}, color ${TRANSITION}`;
  }, [theme]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }
      if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        setInverted((v) => !v);
      }
      if (e.key === ' ') {
        e.preventDefault();
        setThemeIndex((v) => (v + 1) % VIRGIL_THEME_COUNT);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const advanceTheme = useCallback(() => {
    setThemeIndex((v) => (v + 1) % VIRGIL_THEME_COUNT);
  }, []);

  return { themeIndex, theme, inverted, advanceTheme };
};
