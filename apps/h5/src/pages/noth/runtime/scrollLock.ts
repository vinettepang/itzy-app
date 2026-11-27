import type Lenis from 'lenis';

let locked = false;
let htmlOverflow = '';
let bodyOverflow = '';
let lenisRef: Lenis | null = null;

export function bindScrollLockLenis(lenis: Lenis) {
  lenisRef = lenis;
}

export function lockPageScroll() {
  if (locked) return;
  locked = true;
  lenisRef?.stop();
  htmlOverflow = document.documentElement.style.overflow;
  bodyOverflow = document.body.style.overflow;
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
}

export function unlockPageScroll() {
  if (!locked) return;
  locked = false;
  document.documentElement.style.overflow = htmlOverflow;
  document.body.style.overflow = bodyOverflow;
  lenisRef?.start();
}
