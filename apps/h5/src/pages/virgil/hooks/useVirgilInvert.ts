import { useCallback, useEffect, useState } from 'react';

export function useVirgilInvert() {
  const [inverted, setInverted] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('virgil-inverted', inverted);
    return () => document.documentElement.classList.remove('virgil-inverted');
  }, [inverted]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        setInverted((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const toggle = useCallback(() => setInverted((v) => !v), []);
  return { inverted, toggle };
}
