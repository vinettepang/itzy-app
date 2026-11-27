import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createNothLenis } from './lenis';
import { initHeroVideo } from './heroVideo';
import { initHeroWebgl } from './heroWebgl';
import { initNothLoader } from './loader';
import { initReveals } from './reveals';
import { initScrollMotion } from './scrollMotion';
import { initScrollRefresh } from './scrollRefresh';
import { initMicroInteractions } from './microInteractions';
import { initShowreel } from './showreel';
import { initWorksSection } from './worksSection';
import { initStudioMusee } from './studioMusee';
import { bindScrollLockLenis } from './scrollLock';
import { initFormes } from './formes';
import { initGlitch } from './glitch';
import { initFooterSvg } from './footerSvg';
import { initVideoIo } from './videoIo';
import { initCaseNextProject } from './caseNextProject';
import { initTimelineNext } from './timelineNext';

let activeCleanup: (() => void) | null = null;

export function destroyNothPageRuntime() {
  activeCleanup?.();
  activeCleanup = null;
}

/** React 模式：在 chrome + page HTML 注入后调用 */
export function runNothPageRuntime(root: HTMLElement) {
  destroyNothPageRuntime();

  const parts: (() => void)[] = [];
  const lenisHandle = createNothLenis();
  bindScrollLockLenis(lenisHandle.lenis);
  parts.push(() => lenisHandle.destroy());

  const reveals = initReveals(root);
  parts.push(() => reveals.destroy());

  const onHeroRevealStart = () => reveals.flushNoScroll(false);
  window.addEventListener('loader:hero-reveal-start', onHeroRevealStart);

  const loaderOff = initNothLoader(root, () => {
    lenisHandle.lenis.start();
  });
  parts.push(() => {
    loaderOff();
    window.removeEventListener('loader:hero-reveal-start', onHeroRevealStart);
  });

  lenisHandle.lenis.stop();

  parts.push(initScrollMotion(root));
  parts.push(initShowreel(root));
  parts.push(initScrollRefresh(root));
  parts.push(initHeroVideo(root));
  parts.push(initHeroWebgl(root));
  parts.push(initMicroInteractions(root));
  parts.push(initWorksSection(root));
  parts.push(initStudioMusee(root));
  parts.push(initFormes(root));
  parts.push(initGlitch(root));
  parts.push(initFooterSvg(root));
  parts.push(initVideoIo(root));
  parts.push(initCaseNextProject(root));
  parts.push(initTimelineNext(root));

  requestAnimationFrame(() => ScrollTrigger.refresh());

  activeCleanup = () => {
    parts.reverse().forEach((fn) => fn());
    ScrollTrigger.getAll().forEach((t) => {
      if (t.trigger && root.contains(t.trigger as Node)) t.kill();
    });
  };

  return activeCleanup;
}
