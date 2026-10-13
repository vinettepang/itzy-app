const NEWNEW_NAV_TOP = 0;
const NEWNEW_NAV_PINNED_CLASS = "xkm-coverNav--pinned";

export function setupNewnewHomeScroll(root: HTMLDivElement) {
  const scrollEl = root.querySelector<HTMLElement>(".xkm-scroll");
  const fixedEl = root.querySelector<HTMLElement>(".xkm-fixed");
  const nav = root.querySelector<HTMLElement>(".xkm-coverNav");
  const section = root.querySelector<HTMLElement>(".xkm-section-container");

  if (!scrollEl || !nav || !section) {
    return {
      getMaxScroll: () => Infinity,
      onScroll: () => {},
      cleanup: () => {},
    };
  }

  let maxScroll = 0;
  let pinStart = 0;
  let navHeight = 0;

  const measurePin = () => {
    const wasPinned = nav.classList.contains(NEWNEW_NAV_PINNED_CLASS);
    nav.classList.remove(NEWNEW_NAV_PINNED_CLASS);
    section.style.paddingTop = "";
    navHeight = nav.offsetHeight;
    pinStart =
      nav.getBoundingClientRect().top + window.scrollY - NEWNEW_NAV_TOP;
    if (wasPinned) {
      nav.classList.add(NEWNEW_NAV_PINNED_CLASS);
      section.style.paddingTop = `${navHeight}px`;
    }
  };

  const updateLimits = () => {
    const fixedH = fixedEl?.offsetHeight ?? 0;
    const scrollH = scrollEl.offsetHeight;
    maxScroll = Math.max(0, fixedH + scrollH - window.innerHeight);
    root.style.height = `${scrollH}px`;
    measurePin();
  };

  const updatePin = () => {
    if (window.scrollY >= pinStart) {
      if (!nav.classList.contains(NEWNEW_NAV_PINNED_CLASS)) {
        nav.classList.add(NEWNEW_NAV_PINNED_CLASS);
        section.style.paddingTop = `${navHeight}px`;
      }
    } else {
      nav.classList.remove(NEWNEW_NAV_PINNED_CLASS);
      section.style.paddingTop = "";
    }
  };

  const onScroll = () => {
    updatePin();
    if (window.scrollY > maxScroll) {
      window.scrollTo(0, maxScroll);
    }
  };

  updateLimits();
  onScroll();

  const ro = new ResizeObserver(() => {
    updateLimits();
    onScroll();
  });
  ro.observe(scrollEl);
  const onResize = () => {
    updateLimits();
    onScroll();
  };
  window.addEventListener("resize", onResize);

  return {
    getMaxScroll: () => maxScroll,
    onScroll,
    cleanup: () => {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      nav.classList.remove(NEWNEW_NAV_PINNED_CLASS);
      section.style.paddingTop = "";
      root.style.height = "";
    },
  };
}
