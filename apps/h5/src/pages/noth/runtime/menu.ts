import gsap from 'gsap';
import { NOTH_BASE } from '../paths';
import { lockPageScroll, unlockPageScroll } from './scrollLock';

function isNothHome(): boolean {
  const norm = window.location.pathname.replace(/\/$/, '') || '/';
  return norm === NOTH_BASE;
}

/** main `LC` — works / studio link labels by route */
function syncMenuLink(link: HTMLAnchorElement, labelSpan: HTMLElement) {
  if (!link.dataset.defaultHref) {
    link.dataset.defaultHref = link.getAttribute('href') || '';
    link.dataset.defaultLabel = labelSpan.textContent ?? '';
  }

  const name = (link.dataset.defaultLabel || '').trim().toLowerCase();
  const onHome = isNothHome();

  if (name === 'works') {
    link.style.display = 'block';
    if (onHome) {
      link.setAttribute('href', link.dataset.defaultHref);
      labelSpan.textContent = link.dataset.defaultLabel;
    } else {
      link.setAttribute('href', NOTH_BASE);
      labelSpan.textContent = 'home';
    }
    return;
  }

  if (name === 'studio') {
    link.style.display = onHome ? 'none' : 'block';
  }
}

type RectOffset = { x: number; y: number };

function rectOffsets(rects: SVGRectElement[]): RectOffset[] {
  return rects.map((rect) => {
    const x = parseFloat(rect.getAttribute('x') || '0');
    const y = parseFloat(rect.getAttribute('y') || '0');
    return { x: x + 1 < 3 ? 0.3 : -0.3, y: y + 1 < 3 ? 0.3 : -0.3 };
  });
}

type DesktopMenuBinding = {
  menuBtn: HTMLElement;
  linksW: HTMLElement;
  links: HTMLAnchorElement[];
  spans: HTMLElement[];
  svg: SVGSVGElement | null;
  rects: SVGRectElement[];
  tl: gsap.core.Timeline;
  handleBtnEnter: () => void;
  handleBtnLeave: () => void;
  handleLinksEnter: () => void;
  handleLinksLeave: () => void;
  linkHandlers: { link: HTMLAnchorElement; handleClick: () => void }[];
};

type MobileMenuBinding = {
  isMobile: true;
  menuBtn: HTMLElement;
  svg: SVGSVGElement | null;
  rects: SVGRectElement[];
  menuWrapper: HTMLElement | null;
  logoWrap: HTMLElement | null;
  btnText: HTMLElement | null;
  handleToggle: () => void;
  handleExternalClose: () => void;
  linkHandlers: { link: HTMLElement; handleClick: () => void }[];
};

type MenuBinding = DesktopMenuBinding | MobileMenuBinding;

function initMobileMenu(opts: {
  menuBtn: HTMLElement;
  svg: SVGSVGElement | null;
  rects: SVGRectElement[];
  links: HTMLAnchorElement[];
}): MobileMenuBinding {
  const { menuBtn, svg, rects, links } = opts;
  const menuWrapper = document.querySelector<HTMLElement>('.menu_wrapper');
  const logoWrap = document.querySelector<HTMLElement>('.nav-logo-wrap');
  const btnText =
    menuBtn.querySelector<HTMLElement>('.menu-btn-text') ||
    document.querySelector<HTMLElement>('.menu-btn-text');

  if (svg) gsap.set(svg, { transformOrigin: '50% 50%' });
  const offsets = rectOffsets(rects);

  if (menuWrapper) gsap.set(menuWrapper, { autoAlpha: 0, display: 'none' });
  if (btnText) gsap.set(btnText, { opacity: 0, pointerEvents: 'none' });

  let open = false;

  const close = () => {
    if (!open) return;
    open = false;
    unlockPageScroll();
    if (btnText) {
      gsap.to(btnText, { opacity: 0, pointerEvents: 'none', duration: 0.4, ease: 'power4.out' });
    }
    if (menuWrapper) {
      gsap.to(menuWrapper, {
        autoAlpha: 0,
        duration: 0.4,
        ease: 'power4.out',
        onComplete: () => gsap.set(menuWrapper, { display: 'none' }),
      });
    }
    if (logoWrap) {
      gsap.to(logoWrap, { opacity: 1, pointerEvents: 'auto', duration: 0.4, ease: 'power4.out' });
    }
    if (svg) gsap.to(svg, { rotateZ: 0, duration: 0.5, ease: 'power4.out' });
    rects.forEach((rect) => gsap.to(rect, { x: 0, y: 0, duration: 0.5, ease: 'power4.out' }));
  };

  const openMenu = () => {
    open = true;
    lockPageScroll();
    if (menuWrapper) {
      gsap.set(menuWrapper, { display: 'flex' });
      gsap.to(menuWrapper, { autoAlpha: 1, duration: 0.5, ease: 'power4.out' });
    }
    if (logoWrap) {
      gsap.to(logoWrap, { opacity: 0, pointerEvents: 'none', duration: 0.4, ease: 'power4.out' });
    }
    if (btnText) {
      gsap.to(btnText, { opacity: 1, pointerEvents: 'auto', duration: 0.4, ease: 'power4.out' });
    }
    if (svg) gsap.to(svg, { rotateZ: 45, duration: 0.5, ease: 'power4.out' });
    rects.forEach((rect, i) =>
      gsap.to(rect, { x: offsets[i].x, y: offsets[i].y, duration: 0.5, ease: 'power4.out' }),
    );
  };

  const handleToggle = () => {
    if (open) close();
    else openMenu();
  };

  menuBtn.addEventListener('click', handleToggle);

  const overlayLinks = menuWrapper ? [...menuWrapper.querySelectorAll<HTMLElement>('a')] : [];
  const linkHandlers = [...new Set([...links, ...overlayLinks])].map((link) => {
    const handleClick = () => close();
    link.addEventListener('click', handleClick);
    return { link, handleClick };
  });

  const handleExternalClose = () => close();
  window.addEventListener('menu:close', handleExternalClose);

  return {
    isMobile: true,
    menuBtn,
    svg,
    rects,
    menuWrapper,
    logoWrap,
    btnText,
    handleToggle,
    handleExternalClose,
    linkHandlers,
  };
}

function initDesktopMenu(opts: {
  menuBtn: HTMLElement;
  linksW: HTMLElement;
  links: HTMLAnchorElement[];
  svg: SVGSVGElement | null;
  rects: SVGRectElement[];
}): DesktopMenuBinding {
  const { menuBtn, linksW, links, svg, rects } = opts;

  const spans = links.map((link) => {
    const h = link.getBoundingClientRect().height;
    link.style.overflow = 'hidden';
    link.style.display = 'block';
    link.style.height = `${h}px`;
    const inner = document.createElement('span');
    inner.style.cssText = 'display:block;';
    while (link.firstChild) inner.appendChild(link.firstChild);
    link.appendChild(inner);
    gsap.set(inner, { y: h });
    return inner;
  });

  links.forEach((link, i) => syncMenuLink(link, spans[i]));

  if (svg) gsap.set(svg, { transformOrigin: '50% 50%' });
  const offsets = rectOffsets(rects);

  const tl = gsap.timeline({ paused: true });
  if (svg) tl.to(svg, { rotateZ: 45, duration: 0.5, ease: 'power4.out' }, 0);
  rects.forEach((rect, i) => {
    tl.to(rect, { x: offsets[i].x, y: offsets[i].y, duration: 0.5, ease: 'power4.out' }, 0);
  });
  tl.to(spans, { y: 0, duration: 0.6, ease: 'power4.out', stagger: 0.08 }, 0);

  let open = false;
  let closeTimer: ReturnType<typeof setTimeout> | undefined;

  const playOpen = () => {
    clearTimeout(closeTimer);
    if (!open) {
      open = true;
      tl.play();
    }
  };

  const scheduleClose = () => {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => {
      if (open) {
        open = false;
        tl.reverse();
      }
    }, 60);
  };

  const cancelClose = () => clearTimeout(closeTimer);

  const handleBtnEnter = () => playOpen();
  const handleBtnLeave = () => scheduleClose();
  const handleLinksEnter = () => cancelClose();
  const handleLinksLeave = () => scheduleClose();

  menuBtn.addEventListener('mouseenter', handleBtnEnter);
  menuBtn.addEventListener('mouseleave', handleBtnLeave);
  linksW.addEventListener('mouseenter', handleLinksEnter);
  linksW.addEventListener('mouseleave', handleLinksLeave);

  const linkHandlers = links.map((link) => {
    const handleClick = () => {
      clearTimeout(closeTimer);
      open = false;
      tl.reverse();
    };
    link.addEventListener('click', handleClick);
    return { link, handleClick };
  });

  return {
    menuBtn,
    linksW,
    links,
    spans,
    svg,
    rects,
    tl,
    handleBtnEnter,
    handleBtnLeave,
    handleLinksEnter,
    handleLinksLeave,
    linkHandlers,
  };
}

function destroyMenuBinding(binding: MenuBinding) {
  if ('isMobile' in binding && binding.isMobile) {
    const b = binding;
    b.menuBtn.removeEventListener('click', b.handleToggle);
    window.removeEventListener('menu:close', b.handleExternalClose);
    b.linkHandlers.forEach(({ link, handleClick }) => link.removeEventListener('click', handleClick));
    if (b.svg) {
      gsap.killTweensOf(b.svg);
      gsap.set(b.svg, { clearProps: 'transform' });
    }
    b.rects.forEach((rect) => {
      gsap.killTweensOf(rect);
      gsap.set(rect, { clearProps: 'transform' });
    });
    if (b.menuWrapper) gsap.killTweensOf(b.menuWrapper);
    if (b.logoWrap) {
      gsap.killTweensOf(b.logoWrap);
      gsap.set(b.logoWrap, { clearProps: 'pointerEvents' });
    }
    if (b.btnText) gsap.killTweensOf(b.btnText);
    unlockPageScroll();
    return;
  }

  const b = binding as DesktopMenuBinding;
  b.menuBtn.removeEventListener('mouseenter', b.handleBtnEnter);
  b.menuBtn.removeEventListener('mouseleave', b.handleBtnLeave);
  b.linksW.removeEventListener('mouseenter', b.handleLinksEnter);
  b.linksW.removeEventListener('mouseleave', b.handleLinksLeave);
  b.linkHandlers.forEach(({ link, handleClick }) => link.removeEventListener('click', handleClick));
  b.tl.kill();
  gsap.killTweensOf(b.spans);
  if (b.svg) {
    gsap.killTweensOf(b.svg);
    gsap.set(b.svg, { clearProps: 'transform' });
  }
  b.rects.forEach((rect) => {
    gsap.killTweensOf(rect);
    gsap.set(rect, { clearProps: 'transform' });
  });
  b.spans.forEach((span, i) => {
    const link = b.links[i];
    while (span.firstChild) link.appendChild(span.firstChild);
    span.remove();
    link.style.overflow = '';
    link.style.display = '';
    link.style.height = '';
  });
}

/** 路由变化后更新 Works/Home、Studio 显隐（chrome 只 init 一次时调用） */
export function refreshNothMenuLinks(scope: HTMLElement) {
  scope.querySelectorAll<HTMLAnchorElement>('.menu-w .link-boiler').forEach((link) => {
    const label =
      (link.querySelector(':scope > span') as HTMLElement | null) ??
      (link.firstElementChild as HTMLElement | null) ??
      link;
    syncMenuLink(link, label);
  });
}

/** main `px` / `DC` / `IC` */
export function initNavMenu(scope: HTMLElement): () => void {
  const menus = [...scope.querySelectorAll<HTMLElement>('.menu-w')];
  if (!menus.length) return () => {};

  const bindings: MenuBinding[] = [];

  menus.forEach((menu) => {
    const menuBtn = menu.querySelector<HTMLElement>('.menu-btn');
    const linksW = menu.querySelector<HTMLElement>('.menu-links-w');
    if (!menuBtn || !linksW) return;

    const links = [...linksW.querySelectorAll<HTMLAnchorElement>('.link-boiler')];
    const svg = menuBtn.querySelector<SVGSVGElement>('.menu-svg');
    const rects = svg ? [...svg.querySelectorAll<SVGRectElement>('rect')] : [];
    if (!links.length) return;

    if (window.matchMedia('(max-width: 991px)').matches) {
      bindings.push(initMobileMenu({ menuBtn, svg, rects, links }));
    } else {
      bindings.push(initDesktopMenu({ menuBtn, linksW, links, svg, rects }));
    }
  });

  return () => {
    bindings.forEach(destroyMenuBinding);
  };
}
