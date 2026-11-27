import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, Flip);

/** main `Gv` / `Wv` / `GA` / `pp` / `mp` / grid constants */
const PARALLAX_Y = [80, -150, -100, -160, 100, -90];
const CLIP_START = [
  'inset(100% 100% 0% 0%)',
  'inset(100% 0% 0% 100%)',
  'inset(100% 0% 0% 0%)',
  'inset(100% 100% 0% 0%)',
  'inset(100% 0% 0% 100%)',
  'inset(100% 0% 0% 0%)',
];
const CLIP_END = 'inset(0% 0% 0% 0%)';

const DESKTOP_LAYOUT = [
  { col: '1 / 7', rowOffset: 0, alignSelf: '', imgH: '43.125rem' },
  { col: '9 / 13', rowOffset: 0, alignSelf: 'end', imgH: '26.875rem' },
  { col: '3 / 11', rowOffset: 1, alignSelf: '', imgH: '42.25rem' },
  { col: '1 / 5', rowOffset: 2, alignSelf: 'end', imgH: '26.875rem' },
  { col: '7 / 13', rowOffset: 2, alignSelf: '', imgH: '43.125rem' },
  { col: '3 / 11', rowOffset: 3, alignSelf: '', imgH: '42.25rem' },
] as const;

const ROW_STRIDE = 4;
const MOBILE_COLS = 6;
type MobileLayoutEntry =
  | { col: string; ratio: string; small?: false }
  | { small: true; ratio: string };

const MOBILE_LAYOUT: MobileLayoutEntry[] = [
  { col: '1 / 7', ratio: '1 / 1' },
  { small: true, ratio: '253 / 241' },
  { col: '1 / 7', ratio: '343 / 550' },
];
const MOBILE_SMALL_COL_A = '3 / 7';
const MOBILE_SMALL_COL_B = '1 / 5';

const WORKS_LIST_CLIP_FULL = 'inset(100% 0% 0% 0%)';
const WORKS_LIST_CLIP_A = 'inset(100% 100% 0% 0%)';
const WORKS_LIST_CLIP_B = 'inset(100% 0% 0% 100%)';

type WordRestore = { word: HTMLElement; parent: HTMLElement | null; next: ChildNode | null };

type CursorBinding = {
  link: HTMLElement;
  cursor: HTMLElement;
  s: {
    tx: number;
    ty: number;
    cx: number;
    cy: number;
    raf: number | null;
    active: boolean;
    lastX: number | null;
    lastY: number | null;
  };
  onEnter: () => void;
  onMove: (e: MouseEvent) => void;
  onLeave: () => void;
  hide: () => void;
};

/** main `Zv` — sync `( 07 )` project count from CMS items */
function syncNbrWorksCount(scope: HTMLElement) {
  const wrap = scope.querySelector('.nbr-works-w');
  if (!wrap) return;
  const items = wrap.querySelector('.nbr-projects .w-dyn-items');
  const nbr = wrap.querySelector('.div-block-3 div:nth-child(2)');
  if (!items || !nbr) return;
  const count = items.querySelectorAll('.w-dyn-item').length;
  nbr.textContent = String(count).padStart(2, '0');
}

function bindWorkLinkCursors(section: HTMLElement): CursorBinding[] {
  const bindings: CursorBinding[] = [];
  const links = [...section.querySelectorAll<HTMLElement>('.work-link')];
  if (!links.length) return bindings;

  const smooth = 0.09;

  links.forEach((link) => {
    const cursor = link.querySelector<HTMLElement>('.cursor-work');
    if (!cursor) return;

    gsap.set(link, { position: 'relative' });
    gsap.set(cursor, {
      position: 'absolute',
      xPercent: -50,
      yPercent: -50,
      left: 0,
      top: 0,
      scale: 0,
      autoAlpha: 0,
      pointerEvents: 'none',
      zIndex: 10,
    });
    link.style.cursor = 'none';

    const s = {
      tx: 0,
      ty: 0,
      cx: 0,
      cy: 0,
      raf: null as number | null,
      active: false,
      lastX: null as number | null,
      lastY: null as number | null,
    };

    const tick = () => {
      s.cx += (s.tx - s.cx) * smooth;
      s.cy += (s.ty - s.cy) * smooth;
      gsap.set(cursor, { x: s.cx, y: s.cy });
      if (
        s.active ||
        Math.abs(s.cx - s.tx) > 0.05 ||
        Math.abs(s.cy - s.ty) > 0.05
      ) {
        s.raf = requestAnimationFrame(tick);
      } else {
        s.raf = null;
      }
    };

    const show = () => {
      if (!s.active) {
        s.active = true;
        gsap.to(cursor, {
          scale: 1,
          autoAlpha: 1,
          duration: 0.6,
          ease: 'back.out(1.8)',
          overwrite: 'auto',
        });
      }
      if (!s.raf) s.raf = requestAnimationFrame(tick);
    };

    const hide = () => {
      if (!s.active) return;
      s.active = false;
      gsap.to(cursor, {
        scale: 0,
        autoAlpha: 0,
        duration: 0.38,
        ease: 'power3.in',
        overwrite: 'auto',
      });
    };

    const onEnter = () => {};
    const onMove = (e: MouseEvent) => {
      const rect = link.getBoundingClientRect();
      s.tx = e.clientX - rect.left;
      s.ty = e.clientY - rect.top;
      const moved = e.clientX !== s.lastX || e.clientY !== s.lastY;
      s.lastX = e.clientX;
      s.lastY = e.clientY;
      if (!moved) {
        if (s.active && !s.raf) s.raf = requestAnimationFrame(tick);
        return;
      }
      if (!s.active) {
        s.cx = s.tx;
        s.cy = s.ty;
        gsap.set(cursor, { x: s.cx, y: s.cy });
      }
      show();
      if (!s.raf) s.raf = requestAnimationFrame(tick);
    };
    const onLeave = () => hide();

    link.addEventListener('mouseenter', onEnter);
    link.addEventListener('mousemove', onMove);
    link.addEventListener('mouseleave', onLeave);
    bindings.push({ link, cursor, s, onEnter, onMove, onLeave, hide });
  });

  return bindings;
}

function teardownWorkLinkCursors(bindings: CursorBinding[]) {
  bindings.forEach(({ link, cursor, s, onEnter, onMove, onLeave }) => {
    link.removeEventListener('mouseenter', onEnter);
    link.removeEventListener('mousemove', onMove);
    link.removeEventListener('mouseleave', onLeave);
    if (s.raf) cancelAnimationFrame(s.raf);
    gsap.killTweensOf(cursor);
    link.style.cursor = '';
  });
}

/** main `qv` / `Yv` — WORKS title letter flip on section scroll */
function initWorksTitleFlip(section: HTMLElement) {
  const words = [...section.querySelectorAll<HTMLElement>('.works-word-block-state1 .works-word')];
  const targets = [...section.querySelectorAll<HTMLElement>('.works-word-block-state2')];
  if (!words.length || targets.length < words.length) {
    return { destroy: () => {} };
  }

  const saved: WordRestore[] = words.map((word) => ({
    word,
    parent: word.parentElement,
    next: word.nextSibling,
  }));

  const state = Flip.getState(words);
  words.forEach((word, i) => targets[i].appendChild(word));

  const tl = Flip.from(state, {
    ease: 'power4.inOut',
    duration: 1.4,
    stagger: { each: 0.2, from: 'end' },
    repeat: 1,
    yoyo: true,
    paused: true,
  });

  words.forEach((word, i) => {
    const at = (words.length - 1 - i) * 0.1;
    tl.to(word, { scale: 0.2, duration: 0.8, ease: 'power4.inOut' }, at);
    tl.to(word, { scale: 1, duration: 0.8, ease: 'power4.inOut' }, at + 0.8);
  });

  const st = ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 3,
    animation: tl,
  });

  const destroy = () => {
    st.kill();
    tl.kill();
    saved.forEach(({ word, parent, next }) => {
      if (!parent) return;
      gsap.killTweensOf(word);
      gsap.set(word, { clearProps: 'all' });
      if (next && next.parentNode === parent) parent.insertBefore(word, next);
      else parent.appendChild(word);
    });
  };

  return { destroy };
}

/** main `Xv` — home / works list grid, clip reveals, parallax */
function initHomeWorksGrid(section: HTMLElement) {
  const desktop = window.matchMedia('(min-width: 992px)').matches;
  const scrollTriggers: ScrollTrigger[] = [];
  let mobileGridParent: HTMLElement | null = null;
  let titleFlip: { destroy: () => void } | null = null;
  let resizeTimer: ReturnType<typeof setTimeout> | undefined;
  let onResize: (() => void) | null = null;

  if (desktop) {
    titleFlip = initWorksTitleFlip(section);
    onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        titleFlip?.destroy();
        titleFlip = initWorksTitleFlip(section);
      }, 200);
    };
    window.addEventListener('resize', onResize);
  }

  const cursorBindings = bindWorkLinkCursors(section);
  const items = [...section.querySelectorAll<HTMLElement>('.work_item')];

  if (!desktop && items.length) {
    mobileGridParent = items[0].parentElement;
    if (mobileGridParent) {
      gsap.set(mobileGridParent, {
        display: 'grid',
        gridTemplateColumns: `repeat(${MOBILE_COLS}, 1fr)`,
        gridAutoFlow: 'row dense',
        alignItems: 'start',
      });
    }
  }

  items.forEach((item, i) => {
    const imgWrap = item.querySelector<HTMLElement>('.img-work-w');
    const img = item.querySelector<HTMLElement>('.img-work');

    if (desktop) {
      const layout = DESKTOP_LAYOUT[i % DESKTOP_LAYOUT.length];
      const row = Math.floor(i / DESKTOP_LAYOUT.length) * ROW_STRIDE + layout.rowOffset + 1;
      item.style.gridColumn = layout.col;
      item.style.gridRow = String(row);
      item.style.alignSelf = layout.alignSelf;
      if (imgWrap) imgWrap.style.height = layout.imgH;
    } else {
      const layout = MOBILE_LAYOUT[i % MOBILE_LAYOUT.length];
      let col = 'col' in layout ? layout.col : undefined;
      if ('small' in layout && layout.small) {
        col = Math.floor(i / MOBILE_LAYOUT.length) % 2 === 0 ? MOBILE_SMALL_COL_A : MOBILE_SMALL_COL_B;
      }
      if (col) item.style.gridColumn = col;
      item.style.gridRow = 'auto';
      item.style.alignSelf = 'start';
      item.style.display = 'flex';
      item.style.flexDirection = 'column';
      if (imgWrap) {
        imgWrap.style.width = '100%';
        imgWrap.style.height = 'auto';
        imgWrap.style.aspectRatio = layout.ratio;
      }
    }

    if (imgWrap) gsap.set(imgWrap, { overflow: 'hidden' });
    if (img) {
      gsap.set(img, {
        height: desktop ? 'auto' : '100%',
        width: '100%',
        objectFit: 'cover',
        top: 0,
      });
    }

    if (imgWrap) {
      gsap.set(imgWrap, { clipPath: CLIP_START[i % CLIP_START.length] });
      const clipTween = gsap.to(imgWrap, {
        clipPath: CLIP_END,
        ease: 'power4.inOut',
        duration: 1,
        scrollTrigger: {
          trigger: item,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      });
      if (clipTween.scrollTrigger) scrollTriggers.push(clipTween.scrollTrigger);
    }

    if (desktop) {
      const y = PARALLAX_Y[i % PARALLAX_Y.length];
      const itemTween = gsap.fromTo(
        item,
        { y: 0 },
        {
          y,
          ease: 'none',
          scrollTrigger: {
            trigger: item,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
          },
        },
      );
      if (itemTween.scrollTrigger) scrollTriggers.push(itemTween.scrollTrigger);

      if (img) {
        const imgTween = gsap.fromTo(
          img,
          { yPercent: -5 },
          {
            yPercent: -20,
            ease: 'none',
            scrollTrigger: {
              trigger: item,
              start: 'top bottom',
              end: 'bottom center',
              scrub: 3,
            },
          },
        );
        if (imgTween.scrollTrigger) scrollTriggers.push(imgTween.scrollTrigger);
      }
    }
  });

  return () => {
    if (onResize) {
      window.removeEventListener('resize', onResize);
      clearTimeout(resizeTimer);
    }
    titleFlip?.destroy();
    if (mobileGridParent) {
      gsap.set(mobileGridParent, {
        clearProps: 'display,gridTemplateColumns,gridAutoFlow,alignItems',
      });
    }
    scrollTriggers.forEach((st) => st.kill());
    teardownWorkLinkCursors(cursorBindings);
  };
}

/** main `$v` / `eC` — alternate works gallery (if present in DOM) */
function initWorksListGallery(scope: HTMLElement) {
  const list = scope.querySelector<HTMLElement>('.work-list-img');
  if (!list) return () => {};

  const items = [...list.querySelectorAll<HTMLElement>('.work-item-img')];
  if (!items.length) return () => {};

  const scrollTriggers: ScrollTrigger[] = [];
  const videos: HTMLVideoElement[] = [];

  gsap.set(list, {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 1fr)',
    gridAutoFlow: 'row dense',
    gap: '1.25rem',
    alignItems: 'start',
  });

  items.forEach((item, n) => {
    const img = item.querySelector<HTMLImageElement>('.work-img');
    const altParts = (img?.getAttribute('alt') ?? '')
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
    const videoSrc =
      altParts.find((p) => /^https?:\/\/\S+\.mp4(\?\S*)?$/i.test(p)) ||
      altParts.find((p) => /^https?:\/\//i.test(p));
    const meta = altParts.filter((p) => p !== videoSrc).join(' ');
    const full = /full/i.test(meta);
    const portrait = /portrait/i.test(meta);
    const span = full ? 12 : 6;

    item.style.gridColumn = `span ${span}`;
    gsap.set(item, {
      height: 'auto',
      aspectRatio: portrait ? '3 / 4' : 'auto',
      overflow: 'hidden',
      position: 'relative',
    });
    if (img) {
      gsap.set(img, {
        width: '100%',
        height: portrait ? '100%' : 'auto',
        objectFit: 'cover',
        display: 'block',
      });
    }

    if (videoSrc) {
      const video = document.createElement('video');
      video.src = videoSrc;
      video.muted = true;
      video.loop = true;
      video.autoplay = true;
      video.playsInline = true;
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');
      video.setAttribute('preload', 'auto');
      gsap.set(video, { width: '100%', height: 'auto', display: 'none', opacity: 0 });

      const onCanPlay = () => {
        gsap.set(item, { aspectRatio: 'auto' });
        if (img) gsap.set(img, { display: 'none' });
        gsap.set(video, { display: 'block' });
        gsap.to(video, { opacity: 1, duration: 0.4 });
      };
      const onError = () => video.remove();
      video.addEventListener('canplay', onCanPlay, { once: true });
      video.addEventListener('error', onError, { once: true });
      item.appendChild(video);
      videos.push(video);
      const play = video.play();
      if (play && typeof play.catch === 'function') play.catch(() => {});
    }

    let clipStart = WORKS_LIST_CLIP_FULL;
    if (span < 12) clipStart = n % 2 === 0 ? WORKS_LIST_CLIP_A : WORKS_LIST_CLIP_B;
    gsap.set(item, { clipPath: clipStart });
    const tween = gsap.to(item, {
      clipPath: CLIP_END,
      ease: 'power4.inOut',
      duration: 1.4,
      scrollTrigger: {
        trigger: item,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
    });
    if (tween.scrollTrigger) scrollTriggers.push(tween.scrollTrigger);
  });

  return () => {
    scrollTriggers.forEach((st) => st.kill());
    videos.forEach((video) => {
      video.pause();
      video.removeAttribute('src');
      video.load();
      video.remove();
    });
  };
}

/**
 * main `Xv` + `Zv` + `$v`（`KA` / `eC` 清理）
 */
export function initWorksSection(scope: HTMLElement): () => void {
  const cleanups: (() => void)[] = [];

  syncNbrWorksCount(scope);

  const worksSection = scope.querySelector<HTMLElement>('.section.works');
  if (worksSection) cleanups.push(initHomeWorksGrid(worksSection));

  cleanups.push(initWorksListGallery(scope));

  return () => cleanups.reverse().forEach((fn) => fn());
}
