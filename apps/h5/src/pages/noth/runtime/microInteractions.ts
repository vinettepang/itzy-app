import gsap from 'gsap';

type Cleanup = () => void;

function inScope(scope: HTMLElement, el: Element) {
  return scope.contains(el);
}

/** 对应 main `P_` / `iM` */
function initHoverMe(scope: HTMLElement): Cleanup {
  const entries: {
    element: HTMLElement;
    onMove: (e: MouseEvent) => void;
    onLeave: () => void;
    spans: HTMLElement[];
  }[] = [];

  scope.querySelectorAll<HTMLElement>('[hoverme]').forEach((element) => {
    if (!inScope(scope, element) || element.dataset.hovermeInit === '1') return;
    element.dataset.hovermeInit = '1';

    const chars = element.textContent?.split('') ?? [];
    element.innerHTML = '';
    const spans: HTMLElement[] = [];
    chars.forEach((ch) => {
      const span = document.createElement('span');
      span.textContent = ch === ' ' ? '\u00a0' : ch;
      span.style.display = 'inline-block';
      span.style.willChange = 'transform';
      element.appendChild(span);
      spans.push(span);
    });

    const dist = (x1: number, y1: number, x2: number, y2: number) =>
      Math.hypot(x2 - x1, y2 - y1);
    const angle = (x1: number, y1: number, x2: number, y2: number) =>
      Math.atan2(y2 - y1, x2 - x1);

    const onMove = (e: MouseEvent) => {
      const mx = e.clientX;
      const my = e.clientY;
      const radius = 200;
      const strength = 300;
      spans.forEach((span) => {
        const rect = span.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const d = dist(mx, my, cx, cy);
        if (d < radius) {
          const a = angle(cx, cy, mx, my);
          const f = ((radius - d) / radius) * strength;
          gsap.to(span, {
            x: -Math.cos(a) * f,
            y: -Math.sin(a) * f,
            duration: 2,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        } else {
          gsap.to(span, { x: 0, y: 0, duration: 2, ease: 'power2.out', overwrite: 'auto' });
        }
      });
    };

    const onLeave = () => {
      spans.forEach((span) => {
        gsap.to(span, { x: 0, y: 0, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
      });
    };

    element.addEventListener('mousemove', onMove);
    element.addEventListener('mouseleave', onLeave);
    entries.push({ element, onMove, onLeave, spans });
  });

  return () => {
    entries.forEach(({ element, onMove, onLeave, spans }) => {
      element.removeEventListener('mousemove', onMove);
      element.removeEventListener('mouseleave', onLeave);
      spans.forEach((s) => gsap.killTweensOf(s));
      delete element.dataset.hovermeInit;
    });
  };
}

/** 对应 main `L_` / `aM` */
function initBtnLineArrow(scope: HTMLElement): Cleanup {
  const entries: {
    btn: HTMLElement;
    onEnter: () => void;
    onLeave: () => void;
    lineArrow: HTMLElement;
    baseWidth: number;
  }[] = [];

  scope.querySelectorAll<HTMLElement>('.btn').forEach((btn) => {
    if (!inScope(scope, btn) || btn.dataset.lineArrowInit === '1') return;
    const lineArrow = btn.querySelector<HTMLElement>('.line-arrow');
    if (!lineArrow) return;
    btn.dataset.lineArrowInit = '1';

    const baseWidth = lineArrow.getBoundingClientRect().width;
    const onEnter = () => {
      gsap.to(lineArrow, {
        width: baseWidth * 1.45,
        duration: 0.4,
        ease: 'power4.inOut',
        overwrite: 'auto',
      });
    };
    const onLeave = () => {
      gsap.to(lineArrow, {
        width: baseWidth,
        duration: 0.8,
        ease: 'power4.out',
        overwrite: 'auto',
      });
    };
    btn.addEventListener('mouseenter', onEnter);
    btn.addEventListener('mouseleave', onLeave);
    entries.push({ btn, onEnter, onLeave, lineArrow, baseWidth });
  });

  return () => {
    entries.forEach(({ btn, onEnter, onLeave, lineArrow }) => {
      btn.removeEventListener('mouseenter', onEnter);
      btn.removeEventListener('mouseleave', onLeave);
      gsap.killTweensOf(lineArrow);
      delete btn.dataset.lineArrowInit;
    });
  };
}

/** 对应 main `D_` / `lM` */
function initViewAllArrow(scope: HTMLElement): Cleanup {
  const entries: {
    btn: HTMLElement;
    onEnter: () => void;
    onLeave: () => void;
    tl: gsap.core.Timeline;
  }[] = [];

  scope.querySelectorAll<HTMLElement>('.view-all-btn').forEach((btn) => {
    if (!inScope(scope, btn) || btn.dataset.viewAllInit === '1') return;
    const svg = btn.querySelector('svg');
    const shaft = svg?.querySelector('.arrow-shaft');
    if (!svg || !shaft) return;
    btn.dataset.viewAllInit = '1';

    const extend = 6;
    gsap.set(svg, { transformOrigin: 'left center' });
    const tl = gsap.timeline({ paused: true });
    tl.to(
      shaft,
      {
        attr: { points: `-${extend},7.5 -${extend},7.5 15.5,7.5` },
        duration: 0.45,
        ease: 'power2.inOut',
      },
      0,
    );
    tl.to(svg, { scaleX: 2, duration: 0.45, ease: 'power2.inOut' }, 0);

    const onEnter = () => tl.play();
    const onLeave = () => tl.reverse();
    btn.addEventListener('mouseenter', onEnter);
    btn.addEventListener('mouseleave', onLeave);
    entries.push({ btn, onEnter, onLeave, tl });
  });

  return () => {
    entries.forEach(({ btn, onEnter, onLeave, tl }) => {
      btn.removeEventListener('mouseenter', onEnter);
      btn.removeEventListener('mouseleave', onLeave);
      tl.kill();
      delete btn.dataset.viewAllInit;
    });
  };
}

/** 对应 main `I_` / `oM` — 归档里已有 `.link-underline` 的只绑事件 */
function initLinkUnderline(scope: HTMLElement): Cleanup {
  const entries: {
    link: HTMLElement;
    underline: HTMLElement;
    tl: gsap.core.Timeline;
    onEnter: () => void;
    onLeave: () => void;
    createdUnderline: boolean;
  }[] = [];

  scope.querySelectorAll<HTMLElement>('.link').forEach((link) => {
    if (!inScope(scope, link) || link.dataset.linkUnderlineInit === '1') return;
    link.dataset.linkUnderlineInit = '1';

    let underline = link.querySelector<HTMLElement>('.link-underline');
    let createdUnderline = false;
    if (!underline) {
      underline = document.createElement('span');
      underline.className = 'link-underline';
      underline.style.cssText = [
        'position:absolute',
        'bottom:-3px',
        'left:0',
        'width:0%',
        'height:1px',
        'background:white',
        'pointer-events:none',
      ].join(';');
      link.appendChild(underline);
      createdUnderline = true;
    }

    gsap.set(link, { position: 'relative' });

    const tl = gsap.timeline({ paused: true });
    tl.fromTo(
      underline,
      { width: '0%', left: '0%' },
      { width: '100%', left: '0%', duration: 0.6, ease: 'power4.inOut' },
    );
    tl.add('midway');
    tl.fromTo(
      underline,
      { width: '100%', left: '0%' },
      { width: '0%', left: '100%', duration: 0.6, ease: 'power4.inOut', immediateRender: false },
    );

    const onEnter = () => tl.tweenFromTo(0, 'midway');
    const onLeave = () => tl.play();
    link.addEventListener('mouseenter', onEnter);
    link.addEventListener('mouseleave', onLeave);
    entries.push({ link, underline, tl, onEnter, onLeave, createdUnderline });
  });

  return () => {
    entries.forEach(({ link, underline, tl, onEnter, onLeave, createdUnderline }) => {
      link.removeEventListener('mouseenter', onEnter);
      link.removeEventListener('mouseleave', onLeave);
      tl.kill();
      if (createdUnderline) underline.remove();
      delete link.dataset.linkUnderlineInit;
    });
  };
}

/** 对应 main `U_` / `sM` */
function initEmailArobase(scope: HTMLElement): Cleanup {
  const entries: {
    btn: HTMLElement;
    onEnter: () => void;
    onLeave: () => void;
    arobase: HTMLElement;
  }[] = [];

  scope.querySelectorAll<HTMLElement>('.btn.email').forEach((btn) => {
    if (!inScope(scope, btn) || btn.dataset.emailBtnInit === '1') return;
    const arobase = btn.querySelector<HTMLElement>('.arobase');
    if (!arobase) return;
    btn.dataset.emailBtnInit = '1';

    const onEnter = () => {
      gsap.to(arobase, { scale: 1.2, duration: 0.2, ease: 'power2.in', overwrite: 'auto' });
    };
    const onLeave = () => {
      gsap.to(arobase, { scale: 1, duration: 0.2, ease: 'power2.in', overwrite: 'auto' });
    };
    btn.addEventListener('mouseenter', onEnter);
    btn.addEventListener('mouseleave', onLeave);
    entries.push({ btn, onEnter, onLeave, arobase });
  });

  return () => {
    entries.forEach(({ btn, onEnter, onLeave, arobase }) => {
      btn.removeEventListener('mouseenter', onEnter);
      btn.removeEventListener('mouseleave', onLeave);
      gsap.killTweensOf(arobase);
      delete btn.dataset.emailBtnInit;
    });
  };
}

/** 对应 main `cM` 中的 P_/L_/D_/I_/U_ */
export function initMicroInteractions(scope: HTMLElement): Cleanup {
  const parts = [
    initHoverMe(scope),
    initBtnLineArrow(scope),
    initViewAllArrow(scope),
    initLinkUnderline(scope),
    initEmailArobase(scope),
  ];
  return () => parts.forEach((fn) => fn());
}
