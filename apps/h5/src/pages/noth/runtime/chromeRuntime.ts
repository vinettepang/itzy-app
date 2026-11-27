import { initNavLogo } from './navLogo';
import { initNavMenu, refreshNothMenuLinks } from './menu';

let chromeCleanup: (() => void) | null = null;

/** 顶栏 chrome 只初始化一次（避免换页重复绑 menu/logo） */
export function runNothChromeRuntime(root: HTMLElement) {
  chromeCleanup?.();
  const parts: (() => void)[] = [];
  parts.push(initNavLogo(root));
  parts.push(initNavMenu(root));
  chromeCleanup = () => parts.reverse().forEach((fn) => fn());
}

export function destroyNothChromeRuntime() {
  chromeCleanup?.();
  chromeCleanup = null;
}

export function syncNothChromeForRoute(root: HTMLElement) {
  refreshNothMenuLinks(root);
}
