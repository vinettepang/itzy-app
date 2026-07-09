import { useEffect } from 'react';

/** 生产站 --vw / --initial-vh */
export function useVirgilViewportVars() {
  useEffect(() => {
    const set = () => {
      const vw = Math.min(1, window.innerWidth / 900);
      document.documentElement.style.setProperty('--vw', String(vw));
      document.documentElement.style.setProperty('--initial-vh', `${window.innerHeight}px`);
    };
    set();
    window.addEventListener('resize', set);
    return () => window.removeEventListener('resize', set);
  }, []);
}
