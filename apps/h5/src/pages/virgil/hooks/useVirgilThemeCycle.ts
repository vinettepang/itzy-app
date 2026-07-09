import { type RefObject, useCallback, useRef, useState } from 'react';

const FADE_MS = 500;

function sleep(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

function clearParallax(
  content: HTMLElement | null,
  right: HTMLElement | null,
  announcement: HTMLElement | null,
) {
  if (content) {
    content.style.transform = 'translateY(0)';
    content.style.opacity = '';
  }
  if (right) right.style.transform = '';
  if (announcement) {
    announcement.style.transition = '';
    announcement.style.transform = '';
    announcement.style.opacity = '';
  }
}

type Options = {
  contentRef: RefObject<HTMLElement | null>;
  rightBlockRef: RefObject<HTMLElement | null>;
  announcementRef: RefObject<HTMLElement | null>;
  advanceTheme: () => void;
  onReset: () => void;
};

export function useVirgilThemeCycle({
  contentRef,
  rightBlockRef,
  announcementRef,
  advanceTheme,
  onReset,
}: Options) {
  const [cycleKey, setCycleKey] = useState(0);
  const [fadeMode, setFadeMode] = useState<'idle' | 'out' | 'in'>('idle');
  const cyclingRef = useRef(false);

  const runCycle = useCallback(async () => {
    if (cyclingRef.current) return;
    cyclingRef.current = true;

    setFadeMode('out');
    await sleep(FADE_MS);

    clearParallax(contentRef.current, rightBlockRef.current, announcementRef.current);
    window.scrollTo({ top: 0, behavior: 'instant' });

    advanceTheme();
    onReset();
    setCycleKey((k) => k + 1);

    setFadeMode('in');
    await sleep(FADE_MS);
    setFadeMode('idle');
    cyclingRef.current = false;
  }, [advanceTheme, announcementRef, contentRef, onReset, rightBlockRef]);

  const fadeClass =
    fadeMode === 'out' ? 'virgil--fade-out' : fadeMode === 'in' ? 'virgil--fade-in' : '';

  return { cycleKey, fadeClass, runCycle, cyclingRef };
}
