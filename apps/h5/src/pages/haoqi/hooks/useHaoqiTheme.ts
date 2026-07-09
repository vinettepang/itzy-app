import { useCallback, useState } from 'react';

type ThemeMode = 'system' | 'light' | 'dark';

function prefersDark() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

export function useHaoqiTheme() {
  const [mode, setMode] = useState<ThemeMode>('system');
  const isDark = mode === 'dark' || (mode === 'system' && prefersDark());
  const cycle = useCallback(() => {
    setMode((m) => (m === 'system' ? 'light' : m === 'light' ? 'dark' : 'system'));
  }, []);
  const label = mode === 'system' ? 'A' : mode === 'light' ? 'L' : 'D';
  return { isDark, cycle, label, mode };
}
