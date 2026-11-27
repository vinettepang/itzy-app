import { useEffect, type RefObject } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { NOTH_BASE } from '../paths';
import { NOTH_LEGACY_MAIN } from '../runtime/config';
import { destroyNothPageRuntime, runNothPageRuntime } from '../runtime/index';
import { navigateWithNothTransition } from '../runtime/pageTransition';

const MAIN_SCRIPT_ID = 'noth-main-spa';
const MAIN_SRC = '/noth/assets/8cae500c5405-main.spa.js';

declare global {
  interface Window {
    __nothReinitPage?: () => void;
    __nothOnNavigateEnd?: () => void;
  }
}

let mainLoadPromise: Promise<void> | null = null;

export function loadNothMainBundle(): Promise<void> {
  if (mainLoadPromise) return mainLoadPromise;
  mainLoadPromise = new Promise((resolve, reject) => {
    if (document.getElementById(MAIN_SCRIPT_ID)) {
      resolve();
      return;
    }
    const el = document.createElement('script');
    el.id = MAIN_SCRIPT_ID;
    el.type = 'module';
    el.src = MAIN_SRC;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error('Failed to load Noth main bundle'));
    document.head.appendChild(el);
  });
  return mainLoadPromise;
}

function isInternalNothHref(href: string) {
  return href === NOTH_BASE || href.startsWith(`${NOTH_BASE}/`);
}

/** 原站 main.spa.js + 站内链接交给 React Router */
export function useNothSiteRuntime(root: RefObject<HTMLElement | null>) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const html = document.documentElement;
    html.classList.add('noth-html', 'w-mod-js');
    if ('ontouchstart' in window) html.classList.add('w-mod-touch');
    document.body.classList.add('noth-body');

    const onGotoHome = (ev: Event) => {
      const hash = (ev as CustomEvent<{ hash?: string }>).detail?.hash;
      const path = hash ? `${NOTH_BASE}#${hash}` : NOTH_BASE;
      navigate(path);
    };
    window.addEventListener('noth:goto-home', onGotoHome);

    return () => {
      window.removeEventListener('noth:goto-home', onGotoHome);
      html.classList.remove('noth-html', 'w-mod-js', 'w-mod-touch');
      document.body.classList.remove('noth-body');
    };
  }, [navigate]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      const a = (e.target as Element | null)?.closest('a[href]');
      if (!a || a.getAttribute('target') === '_blank') return;
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:')) return;
      if (!isInternalNothHref(href)) return;
      e.preventDefault();
      navigateWithNothTransition(navigate, href, a);
    };

    el.addEventListener('click', onClick);
    return () => el.removeEventListener('click', onClick);
  }, [navigate, root]);

  useEffect(() => {
    window.dispatchEvent(new Event('menu:close'));
  }, [location.pathname]);

  useEffect(() => {
    const hash = location.hash;
    if (!hash) return;
    const id = hash.replace(/^#/, '');
    const target = document.getElementById(id);
    if (!target) return;
    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [location.pathname, location.hash]);
}

export function nothPageMounted(root: HTMLElement) {
  if (!NOTH_LEGACY_MAIN) {
    requestAnimationFrame(() => {
      runNothPageRuntime(root);
    });
    return;
  }
  void loadNothMainBundle().then(() => {
    requestAnimationFrame(() => {
      window.__nothReinitPage?.();
    });
  });
}

export function nothPageUnmount() {
  if (!NOTH_LEGACY_MAIN) destroyNothPageRuntime();
}
